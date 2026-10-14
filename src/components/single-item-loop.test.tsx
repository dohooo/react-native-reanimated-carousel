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

function SingleItemCarousel(
  props: Partial<CarouselProps<string>> & { ref?: React.Ref<CarouselRef> }
) {
  return (
    <Carousel
      data={["only"]}
      renderItem={({ item }) => <View accessibilityLabel={item} />}
      style={{ width: 300, height: 200 }}
      {...props}
    />
  );
}

describe("looping carousel with a single item", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("moves through its auto-filled copies with next() and prev()", () => {
    const ref = React.createRef<CarouselRef>();
    const offset = { value: 0 } as SharedValue<number>;
    const onScrollStart = jest.fn();
    const onSnapToItem = jest.fn();
    render(
      <SingleItemCarousel
        ref={ref}
        loop
        scrollOffsetValue={offset}
        onScrollStart={onScrollStart}
        onSnapToItem={onSnapToItem}
      />
    );

    act(() => ref.current?.next({ animated: false }));
    expect(offset.value).toBe(-300);
    expect(ref.current?.getCurrentIndex()).toBe(0);

    act(() => ref.current?.prev({ animated: false }));
    expect(offset.value).toBeCloseTo(0);
    expect(onScrollStart).toHaveBeenCalledTimes(2);
    expect(onSnapToItem).toHaveBeenLastCalledWith(0);
  });

  it("starts autoplay", () => {
    const offset = { value: 0 } as SharedValue<number>;
    const onScrollStart = jest.fn();
    render(
      <SingleItemCarousel
        loop
        autoplay
        autoplayInterval={1000}
        scrollOffsetValue={offset}
        onScrollStart={onScrollStart}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // The Reanimated Jest mock never finishes timing animations, so only the first tick can run.
    expect(onScrollStart).toHaveBeenCalledTimes(1);
  });

  it("stays still when it does not loop", () => {
    const ref = React.createRef<CarouselRef>();
    const offset = { value: 0 } as SharedValue<number>;
    const onScrollStart = jest.fn();
    render(
      <SingleItemCarousel
        ref={ref}
        autoplay
        autoplayInterval={1000}
        scrollOffsetValue={offset}
        onScrollStart={onScrollStart}
      />
    );

    act(() => {
      ref.current?.next({ animated: false });
      jest.advanceTimersByTime(3500);
    });

    expect(offset.value).toBeCloseTo(0);
    expect(onScrollStart).not.toHaveBeenCalled();
  });
});
