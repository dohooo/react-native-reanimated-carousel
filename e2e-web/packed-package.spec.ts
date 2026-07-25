import { type Locator, type Page, expect, test } from "@playwright/test";

const PAGE_READY_TIMEOUT = 60_000;

function failOnBrowserErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    errors.push(`requestfailed: ${request.method()} ${request.url()}`);
  });

  return () => expect(errors, errors.join("\n")).toEqual([]);
}

async function expectWidth(locator: Locator, width: number) {
  await expect
    .poll(async () => (await locator.boundingBox())?.width, {
      message: `element width should settle at ${width}px`,
    })
    .toBeCloseTo(width, 0);
}

async function expectAlignedSlide(carousel: Locator, slides: Locator, width: number) {
  await expect
    .poll(async () => {
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
        position: Math.round(visibleSlide.x - carouselBox.x),
        width: Math.round(visibleSlide.width),
      };
    })
    .toEqual({ position: 0, width });
}

test("packed package renders, navigates, and remeasures", async ({ page }) => {
  const assertNoBrowserErrors = failOnBrowserErrors(page);
  await page.goto("/", { waitUntil: "commit" });

  const parent = page.getByTestId("parent");
  const carousel = page.getByTestId("carousel");
  await expect(page.getByTestId("status")).toHaveText("Index: 0; Item Width: 280", {
    timeout: PAGE_READY_TIMEOUT,
  });
  await expectWidth(parent, 280);
  await expectWidth(carousel, 280);
  await expectAlignedSlide(carousel, page.getByTestId("slide-0"), 280);

  await page.getByTestId("next").click();
  await expect(page.getByTestId("status")).toHaveText("Index: 1; Item Width: 280");
  await expectAlignedSlide(carousel, page.getByTestId("slide-1"), 280);

  await page.getByTestId("resize").click();
  await expect(page.getByTestId("status")).toHaveText("Index: 1; Item Width: 340");
  await expectWidth(parent, 340);
  await expectWidth(carousel, 340);
  await expectAlignedSlide(carousel, page.getByTestId("slide-1"), 340);
  assertNoBrowserErrors();
});
