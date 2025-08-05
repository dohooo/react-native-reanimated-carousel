import { horizontalStackLayout, useHorizontalStackLayout, verticalStackLayout } from "./stack";

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

// Mock react
jest.mock("react", () => ({
  useMemo: jest.fn((fn) => fn()),
}));

// Mock Dimensions
jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

describe("horizontalStackLayout", () => {
  it("should make the rotateZDeg works properly when it is passed in horizontal-stack mode through modeConfig", () => {
    const screenWidth = 375;

    const calculator = horizontalStackLayout({
      showLength: 3,
      snapDirection: "left",
      moveSize: screenWidth,
      stackInterval: 18,
      scaleInterval: 0.04,
      opacityInterval: 0.1,
      rotateZDeg: 30,
    });

    const result1 = calculator(-0.5);
    expect(result1).toHaveProperty("transform");
    expect(result1).toHaveProperty("zIndex");
    expect(result1).toHaveProperty("opacity");
    expect(result1.transform).toHaveLength(3);

    const result2 = calculator(-1);
    expect(result2).toHaveProperty("transform");
    expect(result2).toHaveProperty("zIndex");
    expect(result2).toHaveProperty("opacity");
    expect(result2.transform).toHaveLength(3);
  });

  it("should handle right snap direction", () => {
    const calculator = horizontalStackLayout({
      showLength: 3,
      snapDirection: "right",
      moveSize: 375,
      stackInterval: 18,
      scaleInterval: 0.04,
      opacityInterval: 0.1,
      rotateZDeg: 30,
    });

    const result = calculator(0);
    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
    expect(result).toHaveProperty("opacity");
    expect(result.transform).toHaveLength(3);
  });

  it("should handle default config", () => {
    const calculator = horizontalStackLayout();
    const result = calculator(0);

    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
    expect(result).toHaveProperty("opacity");
  });

  it("should handle edge values", () => {
    const calculator = horizontalStackLayout({
      showLength: 5,
      snapDirection: "left",
    });

    const extremeLeftResult = calculator(-2);
    const extremeRightResult = calculator(4);

    expect(extremeLeftResult).toHaveProperty("transform");
    expect(extremeRightResult).toHaveProperty("transform");
  });

  it("should handle custom parameters", () => {
    const calculator = horizontalStackLayout({
      showLength: 4,
      snapDirection: "right",
      moveSize: 400,
      stackInterval: 25,
      scaleInterval: 0.06,
      opacityInterval: 0.15,
      rotateZDeg: 45,
    });

    const result = calculator(1);
    expect(result).toHaveProperty("transform");
    expect(result.transform).toHaveLength(3);
    expect(result.transform?.[2]).toHaveProperty("rotateZ");
  });
});

describe("verticalStackLayout", () => {
  it("should handle left snap direction", () => {
    const calculator = verticalStackLayout({
      showLength: 3,
      snapDirection: "left",
      moveSize: 375,
      stackInterval: 18,
      scaleInterval: 0.04,
      opacityInterval: 0.1,
      rotateZDeg: 30,
    });

    const result = calculator(0);
    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
    expect(result).toHaveProperty("opacity");
    expect(result.transform).toHaveLength(4); // includesTranslateY
    expect(result.transform?.[3]).toHaveProperty("translateY");
  });

  it("should handle right snap direction", () => {
    const calculator = verticalStackLayout({
      showLength: 3,
      snapDirection: "right",
      moveSize: 375,
      stackInterval: 18,
      scaleInterval: 0.04,
      opacityInterval: 0.1,
      rotateZDeg: 30,
    });

    const result = calculator(0);
    expect(result).toHaveProperty("transform");
    expect(result.transform).toHaveLength(4);
    expect(result.transform?.[3]).toHaveProperty("translateY");
  });

  it("should handle default config", () => {
    const calculator = verticalStackLayout();
    const result = calculator(0);

    expect(result).toHaveProperty("transform");
    expect(result).toHaveProperty("zIndex");
    expect(result).toHaveProperty("opacity");
    expect(result.transform).toHaveLength(4);
  });

  it("should handle different values", () => {
    const calculator = verticalStackLayout({
      showLength: 4,
      snapDirection: "left",
    });

    const leftResult = calculator(-1);
    const centerResult = calculator(0);
    const rightResult = calculator(1);

    expect(leftResult).toHaveProperty("transform");
    expect(centerResult).toHaveProperty("transform");
    expect(rightResult).toHaveProperty("transform");
  });

  it("should handle fractional values", () => {
    const calculator = verticalStackLayout({
      showLength: 3,
      snapDirection: "right",
    });

    const result = calculator(0.5);
    expect(result).toHaveProperty("transform");
    expect(result.transform).toHaveLength(4);
  });
});

describe("useHorizontalStackLayout", () => {
  it("should return layout and config for left snap direction", () => {
    const customAnimationConfig = {
      snapDirection: "left" as const,
      showLength: 3,
    };

    const result = useHorizontalStackLayout(customAnimationConfig);

    expect(result).toHaveProperty("layout");
    expect(result).toHaveProperty("config");
    expect(typeof result.layout).toBe("function");
    expect(result.config.type).toBe("positive");
    expect(result.config.viewCount).toBe(3);
  });

  it("should return layout and config for right snap direction", () => {
    const customAnimationConfig = {
      snapDirection: "right" as const,
      showLength: 4,
    };

    const result = useHorizontalStackLayout(customAnimationConfig);

    expect(result).toHaveProperty("layout");
    expect(result).toHaveProperty("config");
    expect(result.config.type).toBe("negative");
    expect(result.config.viewCount).toBe(4);
  });

  it("should handle default config", () => {
    const result = useHorizontalStackLayout();

    expect(result).toHaveProperty("layout");
    expect(result).toHaveProperty("config");
    expect(typeof result.layout).toBe("function");
    expect(result.config.type).toBe("positive"); // Default snapDirection is "left"
  });

  it("should handle empty custom config", () => {
    const result = useHorizontalStackLayout({}, {});

    expect(result).toHaveProperty("layout");
    expect(result).toHaveProperty("config");
  });

  it("should merge custom config correctly", () => {
    const customAnimationConfig = {
      snapDirection: "right" as const,
      showLength: 2,
    };

    const result = useHorizontalStackLayout(customAnimationConfig);

    expect(result.config.type).toBe("negative");
    expect(result.config.viewCount).toBe(2);
  });
});
