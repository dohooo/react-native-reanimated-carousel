import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";

import { act, render as renderNative } from "@testing-library/react-native";

import type { CarouselProps, CarouselRef } from "../types";
import { Carousel } from "./Carousel";

{
  const cfg = (
    global as {
      __reanimatedLoggerConfig?: {
        logFunction: (data: { message: string }) => void;
      };
    }
  ).__reanimatedLoggerConfig;
  if (cfg) {
    const originalLog = cfg.logFunction;
    cfg.logFunction = (data) => {
      if (data.message.includes("measure() cannot be used with Jest")) return;
      originalLog(data);
    };
  }
}

function render(ui: React.ReactElement) {
  return renderNative(ui, { wrapper: GestureHandlerRootView });
}

function AutoplayCarousel(
  props: Partial<CarouselProps<string>> & { ref?: React.Ref<CarouselRef> }
) {
  return (
    <Carousel
      data={["a", "b", "c", "d"]}
      renderItem={({ item }) => <View accessibilityLabel={item} />}
      style={{ width: 300, height: 200 }}
      loop
      autoplay
      autoplayInterval={1000}
      {...props}
    />
  );
}

describe("autoplay dwell around ref commands", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("waits a full interval after scrollTo before the next autoplay step", () => {
    const ref = React.createRef<CarouselRef>();
    const offset = { value: 0 } as SharedValue<number>;
    const onScrollStart = jest.fn();
    render(<AutoplayCarousel ref={ref} scrollOffsetValue={offset} onScrollStart={onScrollStart} />);

    // A pagination tap 600 ms into the first dwell.
    act(() => {
      jest.advanceTimersByTime(600);
      ref.current?.scrollTo({ index: 2, animated: false });
    });
    expect(offset.value).toBe(-600);
    expect(onScrollStart).toHaveBeenCalledTimes(1);

    // The dwell that was running before the tap must not fire 400 ms later.
    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onScrollStart).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onScrollStart).toHaveBeenCalledTimes(2);
  });

  it("keeps autoplaying when a command interrupts an autoplay step", () => {
    const ref = React.createRef<CarouselRef>();
    const offset = { value: 0 } as SharedValue<number>;
    const onScrollStart = jest.fn();
    render(<AutoplayCarousel ref={ref} scrollOffsetValue={offset} onScrollStart={onScrollStart} />);

    // The first autoplay step starts. The Reanimated Jest mock never finishes timing
    // animations, so it stays in flight, like a step that a tap cuts off.
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onScrollStart).toHaveBeenCalledTimes(1);

    act(() => {
      ref.current?.scrollTo({ index: 3, animated: false });
    });
    expect(onScrollStart).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onScrollStart).toHaveBeenCalledTimes(3);
  });

  it("restarts the dwell after next() and prev() as well", () => {
    const ref = React.createRef<CarouselRef>();
    const onScrollStart = jest.fn();
    render(<AutoplayCarousel ref={ref} onScrollStart={onScrollStart} />);

    act(() => {
      jest.advanceTimersByTime(700);
      ref.current?.next({ animated: false });
      jest.advanceTimersByTime(700);
      ref.current?.prev({ animated: false });
      jest.advanceTimersByTime(999);
    });
    expect(onScrollStart).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onScrollStart).toHaveBeenCalledTimes(3);
  });
});
