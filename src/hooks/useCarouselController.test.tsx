import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";
import type { SharedValue } from "react-native-reanimated";

import { GlobalStateContext } from "../store";
import type { CarouselContext } from "../store";
import type { CarouselRef } from "../types";
import { useCarouselController } from "./useCarouselController";

jest.mock("react-native-reanimated", () => {
  const callbacks: Array<(finished: boolean) => void> = [];
  const state = { finishImmediately: true };
  const animate = jest.fn((value, _config, callback) => {
    if (callback) {
      callbacks.push(callback);
      if (state.finishImmediately) callback(true);
    }
    return value;
  });

  return {
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedReaction: jest.fn((prepare, react) => react(prepare())),
    withTiming: animate,
    withSpring: animate,
    mockAnimationCallbacks: callbacks,
    mockAnimationState: state,
  };
});

jest.mock("react-native-worklets", () => ({
  scheduleOnRN: jest.fn((fn, ...args) => fn(...args)),
}));

function shared<T>(value: T): SharedValue<T> {
  return { value } as SharedValue<T>;
}

const movement = {
  startMovement: jest.fn(),
  cancelMovement: jest.fn(),
  settleMovement: jest.fn(),
};

const context = {
  props: {},
  common: {
    size: 300,
    validLength: 4,
    handlerOffset: shared(0),
    resolvedSize: shared<number | null>(300),
    sizePhase: shared("ready"),
    sizeExplicit: true,
    isMoving: shared(false),
    ...movement,
  },
  layout: {
    containerSize: shared({ width: 300, height: 300 }),
    itemDimensions: shared({}),
    updateContainerSize: jest.fn(),
    updateItemDimensions: jest.fn(),
  },
} as unknown as CarouselContext;

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GlobalStateContext.Provider value={context}>{children}</GlobalStateContext.Provider>
);

function renderController(overrides: Partial<Parameters<typeof useCarouselController>[0]> = {}) {
  const handlerOffset = overrides.handlerOffset ?? shared(0);
  const ref = React.createRef<CarouselRef>();
  const onScrollStart = jest.fn();
  const onMovementEnd = jest.fn();
  const options = {
    ref,
    loop: false,
    size: 300,
    dataLength: 5,
    rawDataLength: 5,
    handlerOffset,
    animation: { type: "timing" as const, duration: 300 },
    onScrollStart,
    onMovementEnd,
    ...overrides,
  };

  return {
    ...renderHook(() => useCarouselController(options), { wrapper }),
    handlerOffset,
    ref,
    onScrollStart,
    onMovementEnd,
  };
}

describe("useCarouselController", () => {
  const { mockAnimationCallbacks, mockAnimationState } =
    jest.requireMock("react-native-reanimated");

  beforeEach(() => {
    jest.clearAllMocks();
    mockAnimationCallbacks.length = 0;
    mockAnimationState.finishImmediately = true;
    context.common.sizePhase.value = "ready";
    context.common.resolvedSize.value = 300;
    context.common.isMoving.value = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exposes the settled default index", () => {
    const { result, ref } = renderController({
      defaultIndex: 2,
      handlerOffset: shared(-600),
    });

    expect(result.current.getCurrentIndex()).toBe(2);
    expect(ref.current?.getCurrentIndex()).toBe(2);
  });

  it("moves from the nearest visual page and settles non-animated commands immediately", () => {
    const { result, handlerOffset, onMovementEnd, onScrollStart } = renderController({
      handlerOffset: shared(-780),
    });

    act(() => result.current.next({ animated: false }));

    expect(handlerOffset.value).toBe(-1200);
    expect(onScrollStart).toHaveBeenCalledTimes(1);
    expect(onMovementEnd).toHaveBeenCalledWith(4);
  });

  it("clamps next and prev at non-loop boundaries", () => {
    const atStart = renderController();
    act(() => atStart.result.current.prev({ animated: false }));
    expect(atStart.handlerOffset.value).toBe(0);
    expect(atStart.onScrollStart).not.toHaveBeenCalled();

    const atEnd = renderController({ handlerOffset: shared(-1200), defaultIndex: 4 });
    act(() => atEnd.result.current.next({ animated: false }));
    expect(atEnd.handlerOffset.value).toBe(-1200);
    expect(atEnd.onScrollStart).not.toHaveBeenCalled();
  });

  it("keeps loop offsets unbounded for relative commands", () => {
    const { result, handlerOffset } = renderController({
      loop: true,
      handlerOffset: shared(-1200),
      defaultIndex: 4,
    });

    act(() => result.current.next({ animated: false }));

    expect(handlerOffset.value).toBe(-1500);
    expect(result.current.getCurrentIndex()).toBe(0);
  });

  it("uses the shortest loop path with forward tie-breaking", () => {
    const shortest = renderController({ loop: true });
    act(() => shortest.result.current.scrollTo({ index: 4, animated: false }));
    expect(shortest.handlerOffset.value).toBe(300);

    const tie = renderController({ loop: true, dataLength: 4, rawDataLength: 4 });
    act(() => tie.result.current.scrollTo({ index: 2, animated: false }));
    expect(tie.handlerOffset.value).toBe(-600);
  });

  it("defaults commands to animated and latches getCurrentIndex until settle", () => {
    mockAnimationState.finishImmediately = false;
    const { result, handlerOffset, onMovementEnd } = renderController();

    act(() => result.current.next());
    expect(handlerOffset.value).toBe(-300);
    expect(result.current.getCurrentIndex()).toBe(0);
    expect(onMovementEnd).not.toHaveBeenCalled();

    act(() => mockAnimationCallbacks[0](true));
    expect(result.current.getCurrentIndex()).toBe(1);
    expect(onMovementEnd).toHaveBeenCalledWith(1);
  });

  it("cancels without producing a settled event", () => {
    mockAnimationState.finishImmediately = false;
    const { result, onMovementEnd } = renderController();

    act(() => result.current.next());
    act(() => mockAnimationCallbacks[0](false));

    expect(result.current.getCurrentIndex()).toBe(0);
    expect(onMovementEnd).not.toHaveBeenCalled();
    expect(movement.cancelMovement).toHaveBeenCalled();
  });

  it("validates command arguments and warns only once per instance", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { result, handlerOffset } = renderController();

    act(() => {
      result.current.next({ count: -1 });
      result.current.next({ count: 1.5 });
      result.current.next({ count: 0 });
      result.current.scrollTo({ index: 7 });
      result.current.scrollTo({ index: -1 });
    });

    expect(handlerOffset.value).toBe(0);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("is a no-op for empty and single-item data", () => {
    const empty = renderController({ dataLength: 0, rawDataLength: 0 });
    const single = renderController({ dataLength: 1, rawDataLength: 1 });

    act(() => {
      empty.result.current.next({ animated: false });
      single.result.current.next({ animated: false });
    });

    expect(empty.handlerOffset.value).toBe(0);
    expect(single.handlerOffset.value).toBe(0);
    expect(Number.isNaN(empty.result.current.index.value)).toBe(false);
  });
});
