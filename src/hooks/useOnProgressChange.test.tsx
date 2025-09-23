import { useSharedValue } from "react-native-reanimated";

import { renderHook } from "@testing-library/react-hooks";

import { useOnProgressChange } from "./useOnProgressChange";

// Mock Reanimated and Easing
jest.mock("react-native-reanimated", () => {
  let reactionCallback: ((value: any) => void) | null = null;

  return {
    useSharedValue: jest.fn((initialValue) => ({
      value: initialValue,
    })),
    useAnimatedReaction: jest.fn((deps, cb) => {
      reactionCallback = cb;
      const depsResult = deps();
      cb(depsResult);
      return () => {
        reactionCallback = null;
      };
    }),
    Easing: {
      bezier: () => ({
        factory: () => 0,
      }),
    },
    // Export the helper function for testing
    __triggerReaction: (value: any) => {
      if (reactionCallback) reactionCallback(value);
    },
  };
});

jest.mock("react-native-worklets", () => {
  const mockScheduleOnRN = jest.fn((fn, ...args) => fn(...args));
  return {
    scheduleOnRN: mockScheduleOnRN,
    mockScheduleOnRN,
  };
});

// Mock computedOffsetXValueWithAutoFillData
jest.mock("../utils/computed-with-auto-fill-data", () => ({
  computedOffsetXValueWithAutoFillData: jest.fn(({ value }) => value),
}));

describe("useOnProgressChange", () => {
  const mockOffsetX = useSharedValue(0);
  const mockSizeReady = useSharedValue(true);
  const mockOnProgressChange = jest.fn();
  const { __triggerReaction } = jest.requireMock("react-native-reanimated");

  beforeEach(() => {
    jest.clearAllMocks();
    mockOffsetX.value = 0;
  });

  it("should handle progress change with function callback", () => {
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: false,
        loop: false,
        offsetX: mockOffsetX,
        rawDataLength: 5,
        onProgressChange: mockOnProgressChange,
      })
    );

    mockOffsetX.value = -300; // Move to next slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(mockOnProgressChange).toHaveBeenCalledWith(-300, 1);
  });

  it("should handle progress change with shared value", () => {
    const progressValue = useSharedValue(0);
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: false,
        loop: false,
        offsetX: mockOffsetX,
        rawDataLength: 5,
        onProgressChange: progressValue,
      })
    );

    mockOffsetX.value = -300; // Move to next slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(progressValue.value).toBe(1);
  });

  it("should handle loop mode", () => {
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: false,
        loop: true,
        offsetX: mockOffsetX,
        rawDataLength: 5,
        onProgressChange: mockOnProgressChange,
      })
    );

    mockOffsetX.value = -1500; // Move to last slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(mockOnProgressChange).toHaveBeenCalledWith(-1500, 5);
  });

  it("should handle autoFillData mode", () => {
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: true,
        loop: false,
        offsetX: mockOffsetX,
        rawDataLength: 3,
        onProgressChange: mockOnProgressChange,
      })
    );

    mockOffsetX.value = -300; // Move to next slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(mockOnProgressChange).toHaveBeenCalledWith(-300, 1);
  });

  it("should clamp values when not in loop mode", () => {
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: false,
        loop: false,
        offsetX: mockOffsetX,
        rawDataLength: 3,
        onProgressChange: mockOnProgressChange,
      })
    );

    mockOffsetX.value = 300; // Try to move before first slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(mockOnProgressChange).toHaveBeenCalledWith(0, 0);

    mockOffsetX.value = -900; // Try to move after last slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(mockOnProgressChange).toHaveBeenCalledWith(-600, 2);
  });

  it("should handle positive offset values", () => {
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: false,
        loop: true,
        offsetX: mockOffsetX,
        rawDataLength: 5,
        onProgressChange: mockOnProgressChange,
      })
    );

    mockOffsetX.value = 300; // Move backwards
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    expect(mockOnProgressChange).toHaveBeenCalledWith(300, 4);
  });

  it("should not call onProgressChange if not provided", () => {
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeReady,
        autoFillData: false,
        loop: false,
        offsetX: mockOffsetX,
        rawDataLength: 5,
      })
    );

    mockOffsetX.value = -300; // Move to next slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeReady.value });
    // Should not throw any errors or call any callbacks
  });

  it("should not trigger progress change when size is not ready", () => {
    const mockSizeNotReady = useSharedValue(false);
    renderHook(() =>
      useOnProgressChange({
        size: 300,
        sizeReady: mockSizeNotReady,
        autoFillData: false,
        loop: false,
        offsetX: mockOffsetX,
        rawDataLength: 5,
        onProgressChange: mockOnProgressChange,
      })
    );

    mockOffsetX.value = -300; // Move to next slide
    __triggerReaction({ offset: mockOffsetX.value, ready: mockSizeNotReady.value });
    expect(mockOnProgressChange).not.toHaveBeenCalled();
  });
});
