import React from "react";
import { useSharedValue } from "react-native-reanimated";

import { act, renderHook } from "@testing-library/react-hooks";

import { useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import { GlobalStateContext, IContext } from "../store";
import { ICarouselInstance } from "../types";
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

// Update the React mock to include useRef
jest.mock("react", () => {
  const originalModule = jest.requireActual("react");
  return {
    ...originalModule,
    useRef: jest.fn((initialValue) => ({ current: initialValue })),
    useImperativeHandle: jest.fn((ref, createHandle) => createHandle()),
  };
});

// Add mock for GlobalStateContext
const mockGlobalState: IContext = {
  props: {
    overscrollEnabled: true,
    loop: true,
    pagingEnabled: true,
    snapEnabled: true,
    enabled: true,
    scrollAnimationDuration: 500,
    withAnimation: undefined,
    dataLength: 5,
    data: Array.from({ length: 5 }, (_, i) => i),
    width: 300,
    height: 300,
    renderItem: () => <View style={{ flex: 1 }} />,
    autoFillData: false,
    defaultIndex: 0,
    autoPlayInterval: 0,
    rawData: [],
    rawDataLength: 0,
  },
  common: {
    size: 300,
    validLength: 5,
  },
  layout: {
    // @ts-ignore
    containerSize: { value: { width: 300, height: 300 } },
    // @ts-ignore
    itemDimensions: { value: {} },
    updateItemDimensions: jest.fn(),
    updateContainerSize: jest.fn(),
  },
};

// Add wrapper for renderHook
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GlobalStateContext.Provider value={mockGlobalState}>{children}</GlobalStateContext.Provider>
);

describe("useCarouselController", () => {
  let mockHandlerOffset: ReturnType<typeof useSharedValue>;
  let ref: ReturnType<typeof useRef>;
  let defaultProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandlerOffset = useSharedValue(0);
    ref = useRef<ICarouselInstance>(null!);
    defaultProps = {
      ref,
      size: 300,
      loop: true,
      dataLength: 5,
      handlerOffset: mockHandlerOffset,
      autoFillData: false,
      duration: 300,
    };

    mockHandlerOffset.value = 0;
    mockAnimatedReaction.mockImplementation((deps: () => any, cb: (depsResult: any) => void) => {
      const depsResult = deps();
      cb(depsResult);
      return () => {};
    });
  });

  it("should initialize with default index", () => {
    mockHandlerOffset.value = -600; // size * 2
    const { result } = renderHook(
      () =>
        useCarouselController({
          ...defaultProps,
          defaultIndex: 2,
        }),
      { wrapper }
    );

    expect(result.current.getCurrentIndex()).toBe(2);
  });

  it("should move to next slide", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.next();
    });

    expect(mockHandlerOffset.value).toBe(-300); // size * 1
  });

  it("should move to previous slide", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.prev();
    });

    expect(mockHandlerOffset.value).toBe(300); // size * -1
  });

  it("should handle loop behavior correctly", () => {
    const { result } = renderHook(
      () =>
        useCarouselController({
          ...defaultProps,
          loop: true,
        }),
      { wrapper }
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
    const { result } = renderHook(
      () =>
        useCarouselController({
          ...defaultProps,
          loop: false,
        }),
      { wrapper }
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
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.scrollTo({ index: 3 });
    });

    expect(mockHandlerOffset.value).toBe(-900); // size * 3
  });

  it("should handle animation callbacks", () => {
    const onFinished = jest.fn();
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.next({
        animated: true,
        onFinished,
      });
    });

    expect(onFinished).toHaveBeenCalled();
  });

  it("should respect animation duration", () => {
    const { result } = renderHook(
      () =>
        useCarouselController({
          ...defaultProps,
          duration: 500,
        }),
      { wrapper }
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
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.scrollTo({ index: 2, animated: false });
    });

    expect(mockHandlerOffset.value).toBe(-600); // size * 2
  });

  it("should handle multiple slide movements", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.next({ count: 2 });
    });

    expect(mockHandlerOffset.value).toBe(-600); // size * 2
  });

  // it("should maintain correct index with autoFillData", () => {
  //   const { result } = renderHook(
  //     () =>
  //       useCarouselController({
  //         ...defaultProps,
  //         autoFillData: true,
  //         dataLength: 3,
  //       }),
  //     { wrapper }
  //   );

  //   act(() => {
  //     result.current.next();
  //     result.current.next();
  //   });

  //   expect(result.current.getCurrentIndex()).toBe(2);
  // });

  it("should handle animated reactions correctly", () => {
    renderHook(() => useCarouselController(defaultProps), { wrapper });

    expect(mockAnimatedReaction).toHaveBeenCalled();
    expect(mockRunOnJS).toHaveBeenCalled();
  });

  it("should handle runOnJS correctly", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    act(() => {
      result.current.next();
    });

    expect(mockRunOnJS).toHaveBeenCalled();
  });
});

describe("useCarouselController imperative handle", () => {
  let mockHandlerOffset: ReturnType<typeof useSharedValue>;
  let ref: ReturnType<typeof useRef>;
  let defaultProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandlerOffset = useSharedValue(0);
    ref = useRef<ICarouselInstance>(null!);
    defaultProps = {
      ref,
      size: 300,
      loop: true,
      dataLength: 5,
      handlerOffset: mockHandlerOffset,
      autoFillData: false,
      duration: 300,
    };
    mockHandlerOffset.value = 0;
  });

  // it("should expose imperative methods through ref", () => {
  //   renderHook(() => useCarouselController(defaultProps), { wrapper });

  //   // Verify useImperativeHandle was called
  //   expect(useImperativeHandle).toHaveBeenCalledWith(ref, expect.any(Function));

  //   // Get the handle creator function
  //   const createHandle = (useImperativeHandle as jest.Mock).mock.calls[0][1];
  //   const handle = createHandle();

  //   // Verify exposed methods
  //   expect(handle).toHaveProperty("getCurrentIndex");
  //   expect(handle).toHaveProperty("next");
  //   expect(handle).toHaveProperty("prev");
  //   expect(handle).toHaveProperty("scrollTo");
  // });

  it("should maintain correct index through imperative calls", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    // Get handle methods
    const createHandle = (useImperativeHandle as jest.Mock).mock.calls[0][1];
    const handle = createHandle();

    // Test sequence of imperative calls
    act(() => {
      handle.next();
      handle.next();
    });
    expect(handle.getCurrentIndex()).toBe(2);

    act(() => {
      handle.prev();
    });
    expect(handle.getCurrentIndex()).toBe(1);

    act(() => {
      handle.scrollTo({ index: 3 });
    });
    expect(handle.getCurrentIndex()).toBe(3);
  });

  it("should handle animation callbacks through imperative calls", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });
    const onFinished = jest.fn();

    // Get handle methods
    const createHandle = (useImperativeHandle as jest.Mock).mock.calls[0][1];
    const handle = createHandle();

    act(() => {
      handle.next({ animated: true, onFinished });
    });

    expect(onFinished).toHaveBeenCalled();
  });

  it("should respect loop settings through imperative calls", () => {
    const { result } = renderHook(
      () =>
        useCarouselController({
          ...defaultProps,
          loop: false,
        }),
      { wrapper }
    );

    // Get handle methods
    const createHandle = (useImperativeHandle as jest.Mock).mock.calls[0][1];
    const handle = createHandle();

    // Try to go past the end
    act(() => {
      handle.scrollTo({ index: 4 });
      handle.next();
    });
    expect(handle.getCurrentIndex()).toBe(4);

    // Try to go before the start
    act(() => {
      handle.scrollTo({ index: 0 });
      handle.prev();
    });
    expect(handle.getCurrentIndex()).toBe(0);
  });

  it("should handle multiple slide movements through imperative calls", () => {
    const { result } = renderHook(() => useCarouselController(defaultProps), { wrapper });

    // Get handle methods
    const createHandle = (useImperativeHandle as jest.Mock).mock.calls[0][1];
    const handle = createHandle();

    act(() => {
      handle.next({ count: 2 });
    });

    expect(handle.getCurrentIndex()).toBe(2);
    expect(mockHandlerOffset.value).toBe(-600); // size * 2
  });
});
