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
});
