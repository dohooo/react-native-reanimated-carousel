import { renderHook } from "@testing-library/react-hooks";
import { useSharedValue } from "react-native-reanimated";

import { useOnProgressChange } from "./useOnProgressChange";

jest.mock("react-native-reanimated", () => {
  const React = jest.requireActual("react");
  let prepareReaction: (() => number | null) | null = null;
  let runReaction: ((value: number | null) => void) | null = null;

  return {
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedReaction: jest.fn((prepare, react, dependencies) => {
      React.useEffect(() => {
        prepareReaction = prepare;
        runReaction = react;
        react(prepare());
        return () => {
          if (runReaction === react) {
            prepareReaction = null;
            runReaction = null;
          }
        };
      }, dependencies);
    }),
    __flushReaction: () => {
      if (prepareReaction && runReaction) runReaction(prepareReaction());
    },
  };
});

jest.mock("react-native-worklets", () => ({
  scheduleOnRN: jest.fn((fn, ...args) => fn(...args)),
}));

describe("useOnProgressChange", () => {
  const { __flushReaction } = jest.requireMock("react-native-reanimated");

  it("reports one unbounded logical progress value", () => {
    const offset = useSharedValue(0);
    const ready = useSharedValue(true);
    const callback = jest.fn();
    renderHook(() =>
      useOnProgressChange({
        loop: true,
        offset,
        onProgressChange: callback,
        rawDataLength: 5,
        size: 300,
        sizeReady: ready,
      })
    );

    callback.mockClear();
    offset.value = -1650;
    __flushReaction();

    expect(callback).toHaveBeenCalledWith(5.5);
  });

  it("writes the same value to the progress SharedValue", () => {
    const offset = useSharedValue(-450);
    const progress = useSharedValue(0);
    const ready = useSharedValue(true);
    renderHook(() =>
      useOnProgressChange({
        loop: true,
        offset,
        progress,
        rawDataLength: 3,
        size: 300,
        sizeReady: ready,
      })
    );

    expect(progress.value).toBe(1.5);
  });

  it("clamps non-loop progress to the data bounds", () => {
    const offset = useSharedValue(300);
    const progress = useSharedValue(99);
    const ready = useSharedValue(true);
    renderHook(() =>
      useOnProgressChange({
        loop: false,
        offset,
        progress,
        rawDataLength: 3,
        size: 300,
        sizeReady: ready,
      })
    );
    expect(progress.value).toBe(0);

    offset.value = -900;
    __flushReaction();
    expect(progress.value).toBe(2);
  });

  it("does not emit before size readiness or for empty data", () => {
    const offset = useSharedValue(-300);
    const ready = useSharedValue(false);
    const callback = jest.fn();
    renderHook(() =>
      useOnProgressChange({
        loop: true,
        offset,
        onProgressChange: callback,
        rawDataLength: 0,
        size: 300,
        sizeReady: ready,
      })
    );

    expect(callback).not.toHaveBeenCalled();
  });
});
