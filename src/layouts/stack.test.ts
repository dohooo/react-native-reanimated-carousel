import { horizontalStackLayout, verticalStackLayout } from "./stack";

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

jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

describe("stack layouts", () => {
  it("preserves the horizontal v4 runtime defaults", () => {
    const layout = horizontalStackLayout({
      type: "horizontal-stack",
      visibleCount: 3,
    });
    const result = layout(0);

    expect(result).toMatchObject({ opacity: 1 });
    expect(result.transform).toHaveLength(3);
    expect(result.transform?.[2]).toEqual({ rotateZ: "0deg" });
  });

  it("accepts all flat horizontal fields", () => {
    const layout = horizontalStackLayout({
      type: "horizontal-stack",
      visibleCount: 4,
      exitDirection: "right",
      exitDistance: 400,
      spacing: 25,
      scaleStep: 0.06,
      opacityStep: 0.15,
      rotation: 45,
    });

    expect(layout(1).transform).toEqual([{ translateX: 400 }, { scale: 1 }, { rotateZ: "45deg" }]);
  });

  it("uses a vertical translation for vertical-stack", () => {
    const layout = verticalStackLayout({
      type: "vertical-stack",
      visibleCount: 3,
      exitDirection: "left",
    });
    const result = layout(0);

    expect(result.transform).toHaveLength(4);
    expect(result.transform?.[3]).toHaveProperty("translateY");
  });

  it("supports right-exiting vertical stacks", () => {
    const layout = verticalStackLayout({
      type: "vertical-stack",
      visibleCount: 3,
      exitDirection: "right",
    });

    expect(layout(1).transform?.[0]).toEqual({ translateX: 375 });
  });
});
