import { type Locator, type Page, expect, test } from "@playwright/test";

const ROUTE = "/demos/e2e-testing/web-release-smoke";
const PAGE_READY_TIMEOUT = 60_000;

test.describe.configure({ timeout: 90_000 });

async function expectAxisSize(locator: Locator, axis: "width" | "height", expected: number) {
  await expect
    .poll(async () => (await locator.boundingBox())?.[axis], {
      message: `${axis} should settle at ${expected}px`,
    })
    .toBeCloseTo(expected, 0);
}

async function expectVisibleSlideAxisLayout(
  carousel: Locator,
  slides: Locator,
  axis: "width" | "height",
  expected: number
) {
  const position = axis === "width" ? "x" : "y";

  await expect
    .poll(
      async () => {
        const carouselBox = await carousel.boundingBox();
        if (!carouselBox) return undefined;

        const slideBoxes = await slides.evaluateAll((elements) =>
          elements.map((element) => {
            const rect = (
              element as unknown as {
                getBoundingClientRect(): { x: number; y: number; width: number; height: number };
              }
            ).getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })
        );
        const visibleSlide = slideBoxes.find(
          (box) =>
            box.x < carouselBox.x + carouselBox.width &&
            box.x + box.width > carouselBox.x &&
            box.y < carouselBox.y + carouselBox.height &&
            box.y + box.height > carouselBox.y
        );

        if (!visibleSlide) return undefined;

        return {
          position: Math.round(visibleSlide[position] - carouselBox[position]),
          size: Math.round(visibleSlide[axis]),
        };
      },
      { message: `visible slide ${axis} should fill and align with the ${expected}px carousel` }
    )
    .toEqual({ position: 0, size: expected });
}

async function dragHorizontally(page: Page, carousel: Locator, from: number, to: number) {
  await carousel.scrollIntoViewIfNeeded();
  const box = await carousel.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * from, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to, y, { steps: 12 });
  await page.mouse.up();
}

function failOnBrowserErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    errors.push(`requestfailed: ${request.method()} ${request.url()}`);
  });

  return () => expect(errors, errors.join("\n")).toEqual([]);
}

test("horizontal auto-size follows its parent without losing the active item", async ({ page }) => {
  const assertNoBrowserErrors = failOnBrowserErrors(page);
  await page.goto(ROUTE, { waitUntil: "commit" });

  const parent = page.getByTestId("horizontal-parent");
  const carousel = page.getByTestId("horizontal-carousel");

  await expect(page.getByText("Horizontal Item Width: 320", { exact: true })).toBeVisible({
    timeout: PAGE_READY_TIMEOUT,
  });
  await expectAxisSize(parent, "width", 320);
  await expectAxisSize(carousel, "width", 320);
  await expectVisibleSlideAxisLayout(
    carousel,
    page.getByTestId("horizontal-slide-0"),
    "width",
    320
  );

  await page.getByTestId("horizontal-next").click();
  await expect(page.getByTestId("horizontal-index")).toHaveText("Horizontal Index: 1");

  await page.getByTestId("horizontal-resize").click();
  await expectAxisSize(parent, "width", 520);
  await expectAxisSize(carousel, "width", 520);
  await expect(page.getByTestId("horizontal-index")).toHaveText("Horizontal Index: 1");
  await expectVisibleSlideAxisLayout(
    carousel,
    page.getByTestId("horizontal-slide-1"),
    "width",
    520
  );

  await page.getByTestId("horizontal-next").click();
  await expect(page.getByTestId("horizontal-index")).toHaveText("Horizontal Index: 0");
  await expectVisibleSlideAxisLayout(
    carousel,
    page.getByTestId("horizontal-slide-0"),
    "width",
    520
  );
  assertNoBrowserErrors();
});

test("horizontal carousel responds to real pointer drags", async ({ page }) => {
  const assertNoBrowserErrors = failOnBrowserErrors(page);
  await page.goto(ROUTE, { waitUntil: "commit" });

  const carousel = page.getByTestId("horizontal-carousel");
  await expect(page.getByText("Horizontal Item Width: 320", { exact: true })).toBeVisible({
    timeout: PAGE_READY_TIMEOUT,
  });

  await dragHorizontally(page, carousel, 0.8, 0.2);
  await expect(page.getByTestId("horizontal-index")).toHaveText("Horizontal Index: 1");

  await dragHorizontally(page, carousel, 0.2, 0.8);
  await expect(page.getByTestId("horizontal-index")).toHaveText("Horizontal Index: 0");
  assertNoBrowserErrors();
});

test("vertical auto-size follows its parent without losing the active item", async ({ page }) => {
  const assertNoBrowserErrors = failOnBrowserErrors(page);
  await page.goto(ROUTE, { waitUntil: "commit" });

  const parent = page.getByTestId("vertical-parent");
  const carousel = page.getByTestId("vertical-carousel");

  await expect(page.getByText("Vertical Item Height: 240", { exact: true })).toBeVisible({
    timeout: PAGE_READY_TIMEOUT,
  });
  await expectAxisSize(parent, "height", 240);
  await expectAxisSize(carousel, "height", 240);
  await expectVisibleSlideAxisLayout(carousel, page.getByTestId("vertical-slide-0"), "height", 240);

  await page.getByTestId("vertical-next").click();
  await expect(page.getByTestId("vertical-index")).toHaveText("Vertical Index: 1");

  await page.getByTestId("vertical-resize").click();
  await expectAxisSize(parent, "height", 420);
  await expectAxisSize(carousel, "height", 420);
  await expect(page.getByTestId("vertical-index")).toHaveText("Vertical Index: 1");
  await expectVisibleSlideAxisLayout(carousel, page.getByTestId("vertical-slide-1"), "height", 420);

  await page.getByTestId("vertical-next").click();
  await expect(page.getByTestId("vertical-index")).toHaveText("Vertical Index: 0");
  await expectVisibleSlideAxisLayout(carousel, page.getByTestId("vertical-slide-0"), "height", 420);
  assertNoBrowserErrors();
});
