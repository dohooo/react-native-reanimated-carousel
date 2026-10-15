import React from "react";

import { Table } from "nextra/components";

type ElementWithChildren = React.ReactElement<{ children?: React.ReactNode }>;

// Columns whose cells read as a sentence. On phones they span the card instead of
// sitting next to a label.
const PROSE_COLUMN = /^(description|notes?)$/i;

function elements(node: React.ReactNode): ElementWithChildren[] {
  return React.Children.toArray(node).filter(React.isValidElement) as ElementWithChildren[];
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

function rowsOf(section: ElementWithChildren | undefined) {
  return section ? elements(section.props.children) : [];
}

/**
 * Markdown tables. On wide screens this is Nextra's table. Below 1024px each row
 * becomes a card: the first cell is its title and the other cells are labelled
 * with their column headers, so nothing has to scroll sideways.
 */
export function DocTable({ children, className = "", ...props }: React.ComponentProps<"table">) {
  const sections = elements(children);
  const head = sections.find((section) => section.type === "thead");
  const labels = elements(rowsOf(head)[0]?.props.children).map((cell) =>
    textOf(cell.props.children).trim()
  );

  // Explicit roles keep the table semantics once the phone layout changes `display`.
  const labelled = sections.map((section) => {
    if (section.type === "thead") {
      return React.cloneElement(section as React.ReactElement<Record<string, unknown>>, {
        role: "rowgroup",
        children: rowsOf(section).map((row, index) =>
          React.cloneElement(row as React.ReactElement<Record<string, unknown>>, {
            key: index,
            role: "row",
            children: elements(row.props.children).map((cell, column) =>
              React.cloneElement(cell as React.ReactElement<Record<string, unknown>>, {
                key: column,
                role: "columnheader",
              })
            ),
          })
        ),
      });
    }
    if (section.type !== "tbody") return section;
    const rows = rowsOf(section).map((row) =>
      React.cloneElement(row as React.ReactElement<Record<string, unknown>>, {
        role: "row",
        children: elements(row.props.children).map((cell, column) => {
          const label = labels[column] ?? "";
          return React.cloneElement(cell as React.ReactElement<Record<string, unknown>>, {
            key: column,
            role: "cell",
            "data-label": label,
            "data-prose": PROSE_COLUMN.test(label) ? "" : undefined,
            children: <div className="rnrc-cell">{cell.props.children}</div>,
          });
        }),
      })
    );
    return React.cloneElement(section as React.ReactElement<Record<string, unknown>>, {
      role: "rowgroup",
      children: rows,
    });
  });

  return (
    <Table
      role="table"
      className={`rnrc-table nextra-scrollbar nx-mt-6 nx-p-0 first:nx-mt-0 ${className}`}
      {...props}
    >
      {labelled}
    </Table>
  );
}
