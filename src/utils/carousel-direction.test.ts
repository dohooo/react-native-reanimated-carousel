import {
  getCarouselDirectionSign,
  getHorizontalStackOffsetType,
  toLogicalGestureValue,
  toPhysicalHorizontalValue,
} from "./carousel-direction";

const sources = ["gesture", "command", "autoplay"] as const;
const layouts = ["normal", "parallax", "stack"] as const;

describe("RTL direction matrix", () => {
  it.each([false, true])(
    "keeps logical progress forward across every source and layout when isRTL=%s",
    (isRTL) => {
      for (const loop of [false, true]) {
        for (const source of sources) {
          for (const layout of layouts) {
            const directionSign = getCarouselDirectionSign({
              isRTL,
              orientation: "horizontal",
            });
            const physicalForwardGesture = isRTL ? 1 : -1;
            const logicalOffsetDelta =
              source === "gesture"
                ? toLogicalGestureValue(physicalForwardGesture, directionSign)
                : -1;
            const logicalProgressDelta = -logicalOffsetDelta;

            expect({
              isRTL,
              loop,
              source,
              layout,
              logicalOffsetDelta,
              logicalProgressDelta,
            }).toMatchObject({
              logicalOffsetDelta: -1,
              logicalProgressDelta: 1,
            });
          }
        }
      }
    }
  );

  it("maps horizontal built-in transforms while leaving logical progress unchanged", () => {
    const logicalRelativeProgress = 1;

    expect(
      toPhysicalHorizontalValue(
        logicalRelativeProgress,
        getCarouselDirectionSign({ isRTL: false, orientation: "horizontal" })
      )
    ).toBe(1);
    expect(
      toPhysicalHorizontalValue(
        logicalRelativeProgress,
        getCarouselDirectionSign({ isRTL: true, orientation: "horizontal" })
      )
    ).toBe(-1);
    expect(
      getCarouselDirectionSign({
        isRTL: true,
        orientation: "vertical",
      })
    ).toBe(1);
  });

  it.each([
    ["left", 1, "positive"],
    ["right", 1, "negative"],
    ["left", -1, "negative"],
    ["right", -1, "positive"],
  ] as const)(
    "keeps stack exitDirection=%s physical when directionSign=%i",
    (exitDirection, directionSign, expectedType) => {
      expect(getHorizontalStackOffsetType(exitDirection, directionSign)).toBe(expectedType);
    }
  );
});
