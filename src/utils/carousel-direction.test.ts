import {
  getCarouselDirectionSign,
  getHorizontalStackOffsetType,
  toLogicalGestureValue,
  toPhysicalHorizontalValue,
} from "./carousel-direction";

describe("carousel direction helpers", () => {
  it.each([
    [{ isRTL: false, orientation: "horizontal" }, 1],
    [{ isRTL: true, orientation: "horizontal" }, -1],
    [{ isRTL: false, orientation: "vertical" }, 1],
    [{ isRTL: true, orientation: "vertical" }, 1],
  ] as const)("derives the physical direction sign from %o", (options, expected) => {
    expect(getCarouselDirectionSign(options)).toBe(expected);
  });

  it.each([
    [-120, 1, -120],
    [120, 1, 120],
    [-120, -1, 120],
    [120, -1, -120],
  ] as const)(
    "maps physical gesture value %i with directionSign=%i to %i",
    (physicalValue, directionSign, expected) => {
      expect(toLogicalGestureValue(physicalValue, directionSign)).toBe(expected);
    }
  );

  it.each([
    [-2, 1, -2],
    [2, 1, 2],
    [-2, -1, 2],
    [2, -1, -2],
  ] as const)(
    "maps logical horizontal value %i with directionSign=%i to %i",
    (logicalValue, directionSign, expected) => {
      expect(toPhysicalHorizontalValue(logicalValue, directionSign)).toBe(expected);
    }
  );

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
