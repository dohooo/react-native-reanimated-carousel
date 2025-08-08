import { parallaxLayout } from "./parallax";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  interpolate: jest.fn((value, inputRange, outputRange) => {
    // Simple linear interpolation mock for testing
    const inputMin = inputRange[0];
    const inputMax = inputRange[inputRange.length - 1];
    const outputMin = outputRange[0];
    const outputMax = outputRange[outputRange.length - 1];

    if (value <= inputMin) return outputMin;
    if (value >= inputMax) return outputMax;

    // Linear interpolation
    const progress = (value - inputMin) / (inputMax - inputMin);
    return outputMin + progress * (outputMax - outputMin);
  }),
  Extrapolation: {
    CLAMP: "clamp",
  },
}));

describe("parallaxLayout", () => {
  const baseConfig = {
    size: 300,
    vertical: false,
  };

  it("should create layout function with default config", () => {
    const layout = parallaxLayout(baseConfig);
    expect(typeof layout).toBe("function");
  });

  it("should return transform object for horizontal layout", () => {
    const layout = parallaxLayout(baseConfig);
    const result = layout(0);

    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
    expect(result.transform).toHaveLength(2);
    expect(result.transform[0]).toHaveProperty("translateX");
    expect(result.transform[1]).toHaveProperty("scale");
  });

  it("should return transform object for vertical layout", () => {
    const verticalConfig = { ...baseConfig, vertical: true };
    const layout = parallaxLayout(verticalConfig);
    const result = layout(0);

    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
    expect(result.transform).toHaveLength(2);
    expect(result.transform[0]).toHaveProperty("translateY");
    expect(result.transform[1]).toHaveProperty("scale");
  });

  it("should handle center position (value = 0)", () => {
    const layout = parallaxLayout(baseConfig);
    const result = layout(0);

    // At center position, translateX should be 0
    expect(result.transform[0].translateX).toBe(0);
    // Scale should be a number (parallax logic applied)
    expect(typeof result.transform[1].scale).toBe("number");
  });

  it("should handle left position (value = -1)", () => {
    const layout = parallaxLayout(baseConfig);
    const result = layout(-1);

    // At left position, translateX should be -size + parallaxScrollingOffset
    expect(result.transform[0].translateX).toBe(-200); // -300 + 100
    // Scale should be a number
    expect(typeof result.transform[1].scale).toBe("number");
  });

  it("should handle right position (value = 1)", () => {
    const layout = parallaxLayout(baseConfig);
    const result = layout(1);

    // At right position, translateX should be size - parallaxScrollingOffset
    expect(result.transform[0].translateX).toBe(200); // 300 - 100
    // Scale should be a number
    expect(typeof result.transform[1].scale).toBe("number");
  });

  it("should handle custom parallaxScrollingOffset", () => {
    const modeConfig = { parallaxScrollingOffset: 50 };
    const layout = parallaxLayout(baseConfig, modeConfig);

    const leftResult = layout(-1);
    const rightResult = layout(1);

    expect(leftResult.transform[0].translateX).toBe(-250); // -300 + 50
    expect(rightResult.transform[0].translateX).toBe(250); // 300 - 50
  });

  it("should handle custom parallaxScrollingScale", () => {
    const modeConfig = { parallaxScrollingScale: 0.9 };
    const layout = parallaxLayout(baseConfig, modeConfig);

    const centerResult = layout(0);
    const sideResult = layout(-1);

    // Verify the structure and that scale values are calculated
    expect(typeof centerResult.transform[1].scale).toBe("number");
    expect(typeof sideResult.transform[1].scale).toBe("number");
    expect(centerResult.transform[1].scale).toBeGreaterThan(0);
    expect(sideResult.transform[1].scale).toBeGreaterThan(0);
  });

  it("should handle custom parallaxAdjacentItemScale", () => {
    const modeConfig = {
      parallaxScrollingScale: 0.9,
      parallaxAdjacentItemScale: 0.7,
    };
    const layout = parallaxLayout(baseConfig, modeConfig);

    const centerResult = layout(0);
    const sideResult = layout(-1);

    // Verify the structure and that scale values are calculated
    expect(typeof centerResult.transform[1].scale).toBe("number");
    expect(typeof sideResult.transform[1].scale).toBe("number");
    expect(centerResult.transform[1].scale).toBeGreaterThan(0);
    expect(sideResult.transform[1].scale).toBeGreaterThan(0);
  });

  it("should handle vertical layout with custom config", () => {
    const verticalConfig = { ...baseConfig, vertical: true };
    const modeConfig = { parallaxScrollingOffset: 80 };
    const layout = parallaxLayout(verticalConfig, modeConfig);

    const leftResult = layout(-1);
    const centerResult = layout(0);
    const rightResult = layout(1);

    expect(leftResult.transform[0].translateY).toBe(-220); // -300 + 80
    expect(centerResult.transform[0].translateY).toBe(0);
    expect(rightResult.transform[0].translateY).toBe(220); // 300 - 80
  });

  it("should handle edge case values", () => {
    const layout = parallaxLayout(baseConfig);

    // Test with values beyond the normal range
    const farLeftResult = layout(-2);
    const farRightResult = layout(2);

    expect(typeof farLeftResult.transform[0].translateX).toBe("number");
    expect(typeof farLeftResult.transform[1].scale).toBe("number");
    expect(typeof farRightResult.transform[0].translateX).toBe("number");
    expect(typeof farRightResult.transform[1].scale).toBe("number");
  });

  it("should handle fractional values", () => {
    const layout = parallaxLayout(baseConfig);

    const halfwayResult = layout(0.5);
    const quarterResult = layout(-0.25);

    expect(typeof halfwayResult.transform[0].translateX).toBe("number");
    expect(typeof halfwayResult.transform[1].scale).toBe("number");
    expect(typeof quarterResult.transform[0].translateX).toBe("number");
    expect(typeof quarterResult.transform[1].scale).toBe("number");
  });

  it("should handle zero size", () => {
    const zeroSizeConfig = { ...baseConfig, size: 0 };
    const layout = parallaxLayout(zeroSizeConfig);
    const result = layout(0);

    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
  });

  it("should handle negative size", () => {
    const negativeSizeConfig = { ...baseConfig, size: -100 };
    const layout = parallaxLayout(negativeSizeConfig);
    const result = layout(0);

    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
  });

  it("should handle all config properties at once", () => {
    const fullModeConfig = {
      parallaxScrollingOffset: 75,
      parallaxScrollingScale: 0.85,
      parallaxAdjacentItemScale: 0.6,
    };
    const layout = parallaxLayout(baseConfig, fullModeConfig);

    const centerResult = layout(0);
    const sideResult = layout(-1);

    // Verify the structure and that values are calculated correctly
    expect(typeof centerResult.transform[1].scale).toBe("number");
    expect(typeof sideResult.transform[1].scale).toBe("number");
    expect(sideResult.transform[0].translateX).toBe(-225); // -300 + 75
  });

  it("should handle empty mode config", () => {
    const layout = parallaxLayout(baseConfig, {});
    const result = layout(0);

    // At center (value = 0), scale should be a number (default parallax behavior)
    expect(typeof result.transform[1].scale).toBe("number");
    expect(result.transform[1].scale).toBeGreaterThan(0);
    expect(result.transform[1].scale).toBeLessThanOrEqual(1);
  });

  it("should handle undefined mode config", () => {
    const layout = parallaxLayout(baseConfig, undefined);
    const result = layout(0);

    // At center (value = 0), scale should be a number (default parallax behavior)
    expect(typeof result.transform[1].scale).toBe("number");
    expect(result.transform[1].scale).toBeGreaterThan(0);
    expect(result.transform[1].scale).toBeLessThanOrEqual(1);
  });

  it("should maintain consistent zIndex calculation", () => {
    const layout = parallaxLayout(baseConfig);

    const leftResult = layout(-1);
    const centerResult = layout(0);
    const rightResult = layout(1);

    expect(typeof leftResult.zIndex).toBe("number");
    expect(typeof centerResult.zIndex).toBe("number");
    expect(typeof rightResult.zIndex).toBe("number");

    // Center should have highest zIndex
    expect(centerResult.zIndex).toBeGreaterThanOrEqual(leftResult.zIndex);
    expect(centerResult.zIndex).toBeGreaterThanOrEqual(rightResult.zIndex);
  });
});
