import { parallaxLayout } from "./parallax";

jest.mock("react-native-reanimated", () => ({
  interpolate: jest.fn((value, inputRange, outputRange) => {
    let segment = inputRange.findIndex(
      (input: number, index: number) => index > 0 && value <= input
    );
    if (segment === -1) segment = inputRange.length - 1;
    segment = Math.max(1, segment);

    const inputMin = inputRange[segment - 1];
    const inputMax = inputRange[segment];
    const outputMin = outputRange[segment - 1];
    const outputMax = outputRange[segment];

    if (value <= inputRange[0]) return outputRange[0];
    if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

    const progress = inputMax === inputMin ? 0 : (value - inputMin) / (inputMax - inputMin);
    return outputMin + progress * (outputMax - outputMin);
  }),
  Extrapolation: { CLAMP: "clamp" },
}));

describe("parallaxLayout", () => {
  const baseConfig = { size: 300, isVertical: false, directionSign: 1 as const };

  it("uses the v4 runtime defaults", () => {
    const layout = parallaxLayout(baseConfig, { type: "parallax" });

    expect(layout(-1).transform[0]).toEqual({ translateX: -200 });
    expect(layout(-1).transform[1].scale).toBeCloseTo(0.64);
    expect(layout(0).transform).toEqual([{ translateX: 0 }, { scale: 0.8 }]);
    expect(layout(1).transform[0]).toEqual({ translateX: 200 });
    expect(layout(1).transform[1].scale).toBeCloseTo(0.64);
  });

  it("supports the flat parallax configuration", () => {
    const layout = parallaxLayout(baseConfig, {
      type: "parallax",
      offset: 75,
      scale: 0.85,
      adjacentScale: 0.6,
    });

    expect(layout(-1).transform).toEqual([{ translateX: -225 }, { scale: 0.6 }]);
    expect(layout(0).transform).toEqual([{ translateX: 0 }, { scale: 0.85 }]);
  });

  it("uses the vertical physical axis when requested", () => {
    const layout = parallaxLayout(
      { ...baseConfig, isVertical: true },
      { type: "parallax", offset: 80 }
    );

    expect(layout(-1).transform[0]).toEqual({ translateY: -220 });
    expect(layout(1).transform[0]).toEqual({ translateY: 220 });
  });

  it("mirrors the horizontal physical transform in RTL", () => {
    const layout = parallaxLayout(
      { ...baseConfig, directionSign: -1 },
      { type: "parallax", offset: 80 }
    );

    expect(layout(-1).transform[0]).toEqual({ translateX: 220 });
    expect(layout(1).transform[0]).toEqual({ translateX: -220 });
  });

  it("keeps the centered item above adjacent items", () => {
    const layout = parallaxLayout(baseConfig, { type: "parallax" });

    expect(layout(0).zIndex).toBeGreaterThan(layout(-1).zIndex);
    expect(layout(0).zIndex).toBeGreaterThan(layout(1).zIndex);
  });
});
