#!/usr/bin/env node

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const packageName = "react-native-reanimated-carousel";
const supportedExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const directPropRenames = new Map([
  ["autoPlay", "autoplay"],
  ["autoPlayInterval", "autoplayInterval"],
  ["customAnimation", "itemAnimation"],
  ["defaultScrollOffsetValue", "scrollOffsetValue"],
  ["enabled", "scrollEnabled"],
  ["windowSize", "renderWindowSize"],
]);
const exportedTypeRenames = new Map([
  ["ICarouselInstance", "CarouselRef"],
  ["ILayoutConfig", "CarouselLayout"],
  ["TAnimationStyle", "CarouselItemAnimation"],
  ["TCarouselProps", "CarouselProps"],
]);
const manualMigrationProps = new Set([
  "autoFillData",
  "customConfig",
  "fixedDirection",
  "height",
  "maxScrollDistancePerSwipe",
  "minScrollDistancePerSwipe",
  "mode",
  "modeConfig",
  "onScrollEnd",
  "scrollAnimationDuration",
  "width",
  "withAnimation",
]);

function scriptKind(fileName) {
  if (fileName.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (fileName.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (fileName.endsWith(".ts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function importName(specifier) {
  return (specifier.propertyName ?? specifier.name).text;
}

function jsxAttributeName(attribute) {
  return ts.isJsxAttribute(attribute) && ts.isIdentifier(attribute.name)
    ? attribute.name.text
    : undefined;
}

function expressionFromBooleanAttribute(attribute) {
  if (!attribute.initializer) return ts.factory.createTrue();
  if (ts.isJsxExpression(attribute.initializer)) {
    return attribute.initializer.expression ?? ts.factory.createTrue();
  }
  if (ts.isStringLiteral(attribute.initializer)) {
    if (attribute.initializer.text === "false") return ts.factory.createFalse();
    if (attribute.initializer.text === "true") return ts.factory.createTrue();
  }
  return ts.factory.createTrue();
}

function enumAttribute(name, condition, whenTrue, whenFalse) {
  if (condition.kind === ts.SyntaxKind.TrueKeyword) {
    return ts.factory.createJsxAttribute(
      ts.factory.createIdentifier(name),
      ts.factory.createStringLiteral(whenTrue)
    );
  }
  if (condition.kind === ts.SyntaxKind.FalseKeyword) {
    return ts.factory.createJsxAttribute(
      ts.factory.createIdentifier(name),
      ts.factory.createStringLiteral(whenFalse)
    );
  }

  return ts.factory.createJsxAttribute(
    ts.factory.createIdentifier(name),
    ts.factory.createJsxExpression(
      undefined,
      ts.factory.createConditionalExpression(
        condition,
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createStringLiteral(whenTrue),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        ts.factory.createStringLiteral(whenFalse)
      )
    )
  );
}

function renamedAttribute(attribute, name) {
  return ts.factory.updateJsxAttribute(
    attribute,
    ts.factory.createIdentifier(name),
    attribute.initializer
  );
}

function itemSizeAttribute(attributes) {
  const itemWidth = attributes.find((attribute) => jsxAttributeName(attribute) === "itemWidth");
  const itemHeight = attributes.find((attribute) => jsxAttributeName(attribute) === "itemHeight");
  if (!itemWidth && !itemHeight) return undefined;

  const vertical = attributes.find((attribute) => jsxAttributeName(attribute) === "vertical");
  const verticalCondition = vertical
    ? expressionFromBooleanAttribute(vertical)
    : ts.factory.createFalse();

  let initializer;
  if (itemWidth && itemHeight) {
    if (verticalCondition.kind === ts.SyntaxKind.TrueKeyword) initializer = itemHeight.initializer;
    else if (verticalCondition.kind === ts.SyntaxKind.FalseKeyword) initializer = itemWidth.initializer;
    else {
      const widthExpression = expressionFromBooleanAttribute(itemWidth);
      const heightExpression = expressionFromBooleanAttribute(itemHeight);
      initializer = ts.factory.createJsxExpression(
        undefined,
        ts.factory.createConditionalExpression(
          verticalCondition,
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          heightExpression,
          ts.factory.createToken(ts.SyntaxKind.ColonToken),
          widthExpression
        )
      );
    }
  } else {
    initializer = (itemWidth ?? itemHeight).initializer;
  }

  return ts.factory.createJsxAttribute(
    ts.factory.createIdentifier("itemSize"),
    initializer ?? ts.factory.createJsxExpression(undefined, ts.factory.createTrue())
  );
}

function snapModeAttribute(attributes) {
  const snap = attributes.find((attribute) =>
    ["enableSnap", "snapEnabled"].includes(jsxAttributeName(attribute) ?? "")
  );
  const paging = attributes.find((attribute) => jsxAttributeName(attribute) === "pagingEnabled");
  if (!snap && !paging) return undefined;

  const snapCondition = snap
    ? expressionFromBooleanAttribute(snap)
    : ts.factory.createTrue();
  const pagingCondition = paging
    ? expressionFromBooleanAttribute(paging)
    : ts.factory.createTrue();

  if (snapCondition.kind === ts.SyntaxKind.FalseKeyword) {
    return ts.factory.createJsxAttribute(
      ts.factory.createIdentifier("snapMode"),
      ts.factory.createStringLiteral("none")
    );
  }
  if (
    snapCondition.kind === ts.SyntaxKind.TrueKeyword &&
    pagingCondition.kind === ts.SyntaxKind.TrueKeyword
  ) {
    return ts.factory.createJsxAttribute(
      ts.factory.createIdentifier("snapMode"),
      ts.factory.createStringLiteral("page")
    );
  }
  if (
    snapCondition.kind === ts.SyntaxKind.TrueKeyword &&
    pagingCondition.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return ts.factory.createJsxAttribute(
      ts.factory.createIdentifier("snapMode"),
      ts.factory.createStringLiteral("nearest")
    );
  }

  const modeExpression = ts.factory.createConditionalExpression(
    pagingCondition,
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    ts.factory.createStringLiteral("page"),
    ts.factory.createToken(ts.SyntaxKind.ColonToken),
    ts.factory.createStringLiteral("nearest")
  );
  const expression =
    snapCondition.kind === ts.SyntaxKind.TrueKeyword
      ? modeExpression
      : ts.factory.createConditionalExpression(
          snapCondition,
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          modeExpression,
          ts.factory.createToken(ts.SyntaxKind.ColonToken),
          ts.factory.createStringLiteral("none")
        );

  return ts.factory.createJsxAttribute(
    ts.factory.createIdentifier("snapMode"),
    ts.factory.createJsxExpression(undefined, expression)
  );
}

function migrateCarouselAttributes(properties, warnings, markChanged) {
  const attributes = [...properties.properties];
  const output = [];
  const hasLoop = attributes.some((attribute) => jsxAttributeName(attribute) === "loop");
  const generatedItemSize = itemSizeAttribute(attributes);
  const generatedSnapMode = snapModeAttribute(attributes);

  for (const attribute of attributes) {
    const name = jsxAttributeName(attribute);
    if (!name) {
      output.push(attribute);
      continue;
    }
    if (name === "itemWidth" || name === "itemHeight") {
      markChanged();
      continue;
    }
    if (name === "enableSnap" || name === "snapEnabled" || name === "pagingEnabled") {
      markChanged();
      continue;
    }

    if (name === "vertical") {
      markChanged();
      output.push(
        enumAttribute(
          "orientation",
          expressionFromBooleanAttribute(attribute),
          "vertical",
          "horizontal"
        )
      );
      continue;
    }
    if (name === "autoPlayReverse") {
      markChanged();
      output.push(
        enumAttribute(
          "autoplayDirection",
          expressionFromBooleanAttribute(attribute),
          "backward",
          "forward"
        )
      );
      continue;
    }
    if (directPropRenames.has(name)) {
      markChanged();
      output.push(renamedAttribute(attribute, directPropRenames.get(name)));
      continue;
    }
    if (manualMigrationProps.has(name)) warnings.add(name);
    output.push(attribute);
  }

  if (generatedItemSize) output.push(generatedItemSize);
  if (generatedSnapMode) output.push(generatedSnapMode);
  if (!hasLoop) {
    markChanged();
    output.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("loop"),
        ts.factory.createJsxExpression(undefined, ts.factory.createTrue())
      )
    );
  }

  return ts.factory.updateJsxAttributes(properties, output);
}

export function transformSource(source, fileName = "source.tsx") {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(fileName)
  );
  const carouselNames = new Set();
  const warnings = new Set();
  let didTransform = false;

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== packageName
    ) {
      continue;
    }

    const clause = statement.importClause;
    if (clause?.name) carouselNames.add(clause.name.text);
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const specifier of clause.namedBindings.elements) {
        if (importName(specifier) === "Carousel") carouselNames.add(specifier.name.text);
      }
    }
  }

  const transformer = (context) => {
    const visit = (node) => {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === packageName &&
        node.importClause
      ) {
        const clause = node.importClause;
        const elements =
          clause.namedBindings && ts.isNamedImports(clause.namedBindings)
            ? [...clause.namedBindings.elements]
            : [];

        const migratedElements = elements.map((specifier) => {
          const currentImport = importName(specifier);
          const replacement = exportedTypeRenames.get(currentImport);
          if (!replacement) return specifier;
          didTransform = true;
          return ts.factory.updateImportSpecifier(
            specifier,
            specifier.isTypeOnly,
            ts.factory.createIdentifier(replacement),
            specifier.name
          );
        });

        if (clause.name) {
          didTransform = true;
          const duplicate = migratedElements.some(
            (specifier) =>
              importName(specifier) === "Carousel" && specifier.name.text === clause.name.text
          );
          if (!duplicate) {
            migratedElements.unshift(
              ts.factory.createImportSpecifier(
                false,
                clause.name.text === "Carousel"
                  ? undefined
                  : ts.factory.createIdentifier("Carousel"),
                clause.name
              )
            );
          }
        }

        if (!didTransform) return node;

        return ts.factory.updateImportDeclaration(
          node,
          node.modifiers,
          ts.factory.updateImportClause(
            clause,
            clause.isTypeOnly,
            undefined,
            ts.factory.createNamedImports(migratedElements)
          ),
          node.moduleSpecifier,
          node.attributes
        );
      }

      if (
        ts.isJsxSelfClosingElement(node) &&
        ts.isIdentifier(node.tagName) &&
        carouselNames.has(node.tagName.text)
      ) {
        return ts.factory.updateJsxSelfClosingElement(
          node,
          node.tagName,
          node.typeArguments,
          migrateCarouselAttributes(node.attributes, warnings, () => {
            didTransform = true;
          })
        );
      }

      if (
        ts.isJsxOpeningElement(node) &&
        ts.isIdentifier(node.tagName) &&
        carouselNames.has(node.tagName.text)
      ) {
        return ts.factory.updateJsxOpeningElement(
          node,
          node.tagName,
          node.typeArguments,
          migrateCarouselAttributes(node.attributes, warnings, () => {
            didTransform = true;
          })
        );
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (root) => ts.visitNode(root, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const transformed = result.transformed[0];
  const output = didTransform
    ? ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(transformed)
    : source;
  result.dispose();

  return {
    changed: didTransform && output.trimEnd() !== source.trimEnd(),
    code: output,
    warnings: [...warnings].sort(),
  };
}

async function collectFiles(inputPath) {
  const metadata = await stat(inputPath);
  if (metadata.isFile()) {
    return supportedExtensions.has(path.extname(inputPath)) ? [inputPath] : [];
  }

  const files = [];
  for (const entry of await readdir(inputPath, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    files.push(...(await collectFiles(path.join(inputPath, entry.name))));
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry");
  const inputs = args.filter((arg) => arg !== "--dry");
  if (inputs.length === 0) {
    console.error("Usage: node scripts/codemods/v5.mjs [--dry] <file-or-directory> [...]");
    process.exitCode = 2;
    return;
  }

  const files = (
    await Promise.all(inputs.map((input) => collectFiles(path.resolve(process.cwd(), input))))
  ).flat();
  let changed = 0;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const result = transformSource(source, file);
    if (!result.changed) {
      if (result.warnings.length > 0) {
        const relative = path.relative(process.cwd(), file);
        console.warn(`review ${relative}`);
        console.warn(
          `  manual migration still required for: ${result.warnings.map((name) => `\`${name}\``).join(", ")}`
        );
      }
      continue;
    }
    changed += 1;
    if (!dryRun) await writeFile(file, result.code);
    const relative = path.relative(process.cwd(), file);
    console.log(`${dryRun ? "would update" : "updated"} ${relative}`);
    if (result.warnings.length > 0) {
      console.warn(
        `  manual migration still required for: ${result.warnings.map((name) => `\`${name}\``).join(", ")}`
      );
    }
  }

  console.log(`${dryRun ? "would update" : "updated"} ${changed} file(s)`);
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  });
}
