import { withSpring, withTiming } from "react-native-reanimated";

import { dealWithAnimation } from "./deal-with-animation";

// Mock Reanimated
jest.mock("react-native-reanimated", () => ({
  withSpring: jest.fn((value, _config, callback) => {
    callback?.(true);
    return value;
  }),
  withTiming: jest.fn((value, _config, callback) => {
    callback?.(true);
    return value;
  }),
}));

describe("dealWithAnimation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle spring animation", () => {
    const callback = jest.fn();
    const springConfig = {
      damping: 20,
      stiffness: 90,
    };

    const animation = dealWithAnimation({
      type: "spring",
      config: springConfig,
    });

    const result = animation(100, callback);

    expect(withSpring).toHaveBeenCalledWith(100, springConfig, expect.any(Function));
    expect(callback).toHaveBeenCalledWith(true);
    expect(result).toBe(100);
  });

  it("should handle timing animation", () => {
    const callback = jest.fn();
    const timingConfig = {
      duration: 300,
    };

    const animation = dealWithAnimation({
      type: "timing",
      config: timingConfig,
    });

    const result = animation(100, callback);

    expect(withTiming).toHaveBeenCalledWith(100, timingConfig, expect.any(Function));
    expect(callback).toHaveBeenCalledWith(true);
    expect(result).toBe(100);
  });

  it("should pass animation config correctly", () => {
    const springConfig = {
      damping: 10,
      mass: 1,
      stiffness: 100,
    };

    const animation = dealWithAnimation({
      type: "spring",
      config: springConfig,
    });

    animation(100, jest.fn());

    expect(withSpring).toHaveBeenCalledWith(
      100,
      expect.objectContaining(springConfig),
      expect.any(Function)
    );
  });

  it("should handle animation completion", () => {
    const callback = jest.fn();
    const animation = dealWithAnimation({
      type: "timing",
      config: { duration: 300 },
    });

    animation(100, callback);

    expect(callback).toHaveBeenCalledWith(true);
  });

  it("should handle spring animation with different values", () => {
    const callback = jest.fn();
    const animation = dealWithAnimation({
      type: "spring",
      config: { damping: 15 },
    });

    animation(0, callback);
    animation(-100, callback);
    animation(500, callback);

    expect(withSpring).toHaveBeenCalledWith(0, { damping: 15 }, expect.any(Function));
    expect(withSpring).toHaveBeenCalledWith(-100, { damping: 15 }, expect.any(Function));
    expect(withSpring).toHaveBeenCalledWith(500, { damping: 15 }, expect.any(Function));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("should handle timing animation with different values", () => {
    const callback = jest.fn();
    const animation = dealWithAnimation({
      type: "timing",
      config: { duration: 500 },
    });

    animation(0, callback);
    animation(-50, callback);
    animation(1000, callback);

    expect(withTiming).toHaveBeenCalledWith(0, { duration: 500 }, expect.any(Function));
    expect(withTiming).toHaveBeenCalledWith(-50, { duration: 500 }, expect.any(Function));
    expect(withTiming).toHaveBeenCalledWith(1000, { duration: 500 }, expect.any(Function));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("should handle empty spring config", () => {
    const callback = jest.fn();
    const animation = dealWithAnimation({
      type: "spring",
      config: {},
    });

    animation(100, callback);

    expect(withSpring).toHaveBeenCalledWith(100, {}, expect.any(Function));
    expect(callback).toHaveBeenCalledWith(true);
  });

  it("should handle empty timing config", () => {
    const callback = jest.fn();
    const animation = dealWithAnimation({
      type: "timing",
      config: {},
    });

    animation(100, callback);

    expect(withTiming).toHaveBeenCalledWith(100, {}, expect.any(Function));
    expect(callback).toHaveBeenCalledWith(true);
  });

  it("should handle fractional values", () => {
    const callback = jest.fn();
    const animation = dealWithAnimation({
      type: "spring",
      config: { damping: 10 },
    });

    animation(50.5, callback);
    animation(-25.75, callback);

    expect(withSpring).toHaveBeenCalledWith(50.5, { damping: 10 }, expect.any(Function));
    expect(withSpring).toHaveBeenCalledWith(-25.75, { damping: 10 }, expect.any(Function));
  });

  it("should create different animation functions for different configs", () => {
    const animation1 = dealWithAnimation({
      type: "spring",
      config: { damping: 10 },
    });

    const animation2 = dealWithAnimation({
      type: "timing",
      config: { duration: 200 },
    });

    expect(animation1).not.toBe(animation2);
    expect(typeof animation1).toBe("function");
    expect(typeof animation2).toBe("function");
  });
});
