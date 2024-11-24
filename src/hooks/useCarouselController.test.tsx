import { useSharedValue } from "react-native-reanimated";

import { act, renderHook } from "@testing-library/react-hooks";

import { useCarouselController } from "./useCarouselController";

// Mock Reanimated
jest.mock("react-native-reanimated", () => {
  const mockRunOnJS = jest.fn((fn) => {
    return (...args: any[]) => {
      return fn(...args);
    };
  });

  const mockAnimatedReaction = jest.fn((deps, cb) => {
    const depsResult = deps();
    cb(depsResult);
    return () => {};
  });

  return {
    useSharedValue: jest.fn((initialValue) => ({
      value: initialValue,
    })),
    useDerivedValue: jest.fn((callback) => ({
      value: callback(),
    })),
    useAnimatedReaction: mockAnimatedReaction,
    withTiming: jest.fn((toValue, config, callback) => {
      if (callback) callback(true);

      return toValue;
    }),
    runOnJS: mockRunOnJS,
    mockAnimatedReaction,
    mockRunOnJS,
    Easing: {
      bezier: () => ({
        factory: () => 0,
      }),
    },
  };
});

// Get mock functions for testing
const { mockAnimatedReaction, mockRunOnJS } = jest.requireMock("react-native-reanimated");

describe("useCarouselController", () => {
  const mockHandlerOffset = useSharedValue(0);
  const defaultProps = {
    size: 300,
    loop: true,
    dataLength: 5,
    handlerOffset: mockHandlerOffset,
    autoFillData: false,
    duration: 300,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandlerOffset.value = 0;
    // Reset mock implementation
    mockAnimatedReaction.mockImplementation((deps: () => any, cb: (depsResult: any) => void) => {
      const depsResult = deps();
      cb(depsResult);
      return () => {};
    });
  });

  it("should initialize with default index", () => {
    mockHandlerOffset.value = -600; // size * 2
    const { result } = renderHook(() =>
      useCarouselController({
        ...defaultProps,
        defaultIndex: 2,
      })
    );

    expect(result.current.getCurrentIndex()).toBe(2);
  });

  it("should move to next slide", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.next();
    });

    expect(mockHandlerOffset.value).toBe(-300); // size * 1
  });

  it("should move to previous slide", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.prev();
    });

    expect(mockHandlerOffset.value).toBe(300); // size * -1
  });

  it("should handle loop behavior correctly", () => {
    const { result } = renderHook(() =>
      useCarouselController({
        ...defaultProps,
        loop: true,
      })
    );

    // Move to last slide
    act(() => {
      result.current.scrollTo({ index: 4 });
    });

    // Try to go next (should loop to first)
    act(() => {
      result.current.next();
    });

    expect(mockHandlerOffset.value).toBe(-1500); // size * 5
  });

  it("should prevent movement when loop is disabled and at bounds", () => {
    const { result } = renderHook(() =>
      useCarouselController({
        ...defaultProps,
        loop: false,
      })
    );

    // Try to go previous at start
    act(() => {
      result.current.prev();
    });
    expect(mockHandlerOffset.value).toBe(0);

    // Go to end
    act(() => {
      result.current.scrollTo({ index: 4 });
    });

    // Try to go next at end
    act(() => {
      result.current.next();
    });
    expect(mockHandlerOffset.value).toBe(-1200); // size * 4
  });

  it("should scroll to specific index", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.scrollTo({ index: 3 });
    });

    expect(mockHandlerOffset.value).toBe(-900); // size * 3
  });

  it("should handle animation callbacks", () => {
    const onFinished = jest.fn();
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.next({
        animated: true,
        onFinished,
      });
    });

    expect(onFinished).toHaveBeenCalled();
  });

  it("should respect animation duration", () => {
    const { result } = renderHook(() =>
      useCarouselController({
        ...defaultProps,
        duration: 500,
      })
    );

    const onFinished = jest.fn();
    act(() => {
      result.current.next({
        animated: true,
        onFinished,
      });
    });

    expect(onFinished).toHaveBeenCalled();
  });

  it("should handle non-animated transitions", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.scrollTo({ index: 2, animated: false });
    });

    expect(mockHandlerOffset.value).toBe(-600); // size * 2
  });

  it("should handle multiple slide movements", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.next({ count: 2 });
    });

    expect(mockHandlerOffset.value).toBe(-600); // size * 2
  });

  it("should maintain correct index with autoFillData", () => {
    const { result } = renderHook(() =>
      useCarouselController({
        ...defaultProps,
        autoFillData: true,
        dataLength: 3,
      })
    );

    act(() => {
      result.current.next();
      result.current.next();
    });

    expect(result.current.getCurrentIndex()).toBe(2);
  });

  it("should handle animated reactions correctly", () => {
    renderHook(() => useCarouselController(defaultProps));

    expect(mockAnimatedReaction).toHaveBeenCalled();
    expect(mockRunOnJS).toHaveBeenCalled();
  });

  it("should handle runOnJS correctly", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps));

    act(() => {
      result.current.next();
    });

    expect(mockRunOnJS).toHaveBeenCalled();
  });
});
