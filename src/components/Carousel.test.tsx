import React from "react";
import { I18nManager, View } from "react-native";
import { Gesture, GestureHandlerRootView, State } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";

import { act, fireEvent, render as renderNative, waitFor } from "@testing-library/react-native";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import { Carousel } from "./Carousel";
import { resolveCarouselLayoutStyle } from "./CarouselLayout";
import { resolveItemMainAxisSize } from "./ItemLayout";

import type { CarouselProps, CarouselRef } from "../types";

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

const gestureTestId = "rnrc-gesture-handler";
const realPan = Gesture.Pan();
type LegacyPanGesture = ReturnType<typeof Gesture.Pan>;
const originalIsRTL = I18nManager.isRTL;

function render(ui: React.ReactElement) {
  return renderNative(ui, { wrapper: GestureHandlerRootView });
}

function setRTL(isRTL: boolean) {
  Object.defineProperty(I18nManager, "isRTL", {
    configurable: true,
    value: isRTL,
  });
}

function TestCarousel({
  progress,
  ...props
}: {
  progress?: SharedValue<number>;
  ref?: React.Ref<CarouselRef>;
} & Partial<CarouselProps<string>>) {
  const localProgress = useSharedValue(0);

  return (
    <Carousel
      data={["A", "B", "C", "D"]}
      renderItem={({ item, index, relativeProgress }) => (
        <View
          testID={`item-${index}`}
          accessibilityLabel={item}
          accessibilityHint={relativeProgress ? "has-progress" : undefined}
        />
      )}
      progress={progress ?? localProgress}
      style={{ width: 300, height: 200 }}
      {...props}
    />
  );
}

describe("Carousel v5 integration", () => {
  beforeEach(() => {
    setRTL(false);
    jest.useFakeTimers();
    jest.spyOn(Gesture, "Pan").mockImplementation(() => realPan.withTestId(gestureTestId));
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    setRTL(originalIsRTL);
    jest.restoreAllMocks();
  });

  it("renders through the named export and forwards root props", () => {
    const onLayout = jest.fn();
    const screen = render(
      <TestCarousel testID="carousel" onLayout={onLayout} style={{ width: 320, height: 180 }} />
    );

    expect(screen.getByTestId("carousel")).toBeTruthy();
    expect(screen.getByTestId("carousel-content-container")).toBeTruthy();
    expect(screen.getByTestId("item-0")).toBeTruthy();

    fireEvent(screen.getByTestId("carousel"), "layout", {
      nativeEvent: { layout: { width: 320, height: 180, x: 0, y: 0 } },
    });
    expect(onLayout).toHaveBeenCalled();
  });

  it("exposes the settled ref API and emits one lifecycle for a non-animated command", () => {
    const ref = React.createRef<CarouselRef>();
    const onScrollStart = jest.fn();
    const onSnapToItem = jest.fn();
    render(<TestCarousel ref={ref} onScrollStart={onScrollStart} onSnapToItem={onSnapToItem} />);

    act(() => ref.current?.next({ animated: false }));

    expect(ref.current?.getCurrentIndex()).toBe(1);
    expect(onScrollStart).toHaveBeenCalledTimes(1);
    expect(onSnapToItem).toHaveBeenCalledWith(1);
  });

  it("defaults to non-looping behavior", () => {
    const ref = React.createRef<CarouselRef>();
    const onScrollStart = jest.fn();
    render(<TestCarousel ref={ref} onScrollStart={onScrollStart} />);

    act(() => ref.current?.prev({ animated: false }));

    expect(ref.current?.getCurrentIndex()).toBe(0);
    expect(onScrollStart).not.toHaveBeenCalled();
  });

  it("keeps the raw offset independently writable from public progress", () => {
    const ref = React.createRef<CarouselRef>();
    const progress = { value: 0 } as SharedValue<number>;
    const offset = { value: 0 } as SharedValue<number>;
    render(<TestCarousel ref={ref} progress={progress} scrollOffsetValue={offset} loop />);

    act(() => ref.current?.prev({ animated: false }));

    expect(offset.value).toBe(300);
    expect(ref.current?.getCurrentIndex()).toBe(3);
  });

  it("starts gesture lifecycle only after non-zero movement", async () => {
    const onScrollStart = jest.fn();
    const onSnapToItem = jest.fn();
    render(<TestCarousel onScrollStart={onScrollStart} onSnapToItem={onSnapToItem} />);

    fireGestureHandler<LegacyPanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: 0 },
      { state: State.ACTIVE, translationX: 0, velocityX: 0 },
      { state: State.ACTIVE, translationX: -180, velocityX: -300 },
      { state: State.END, translationX: -300, velocityX: -300 },
    ]);

    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => {
      expect(onScrollStart).toHaveBeenCalledTimes(1);
      expect(onSnapToItem).toHaveBeenCalledWith(1);
    });
  });

  it("uses a physical rightward swipe for logical forward navigation in RTL", async () => {
    setRTL(true);
    const onSnapToItem = jest.fn();
    const onObservedUpdate = jest.fn();
    render(
      <TestCarousel
        onConfigurePanGesture={(gesture) => {
          gesture.onUpdate(onObservedUpdate);
        }}
        onSnapToItem={onSnapToItem}
      />
    );

    fireGestureHandler<LegacyPanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: 0 },
      { state: State.ACTIVE, translationX: 0, velocityX: 0 },
      { state: State.ACTIVE, translationX: 180, velocityX: 300 },
      { state: State.END, translationX: 300, velocityX: 300 },
    ]);

    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => {
      expect(onSnapToItem).toHaveBeenCalledWith(1);
    });
    expect(onObservedUpdate).toHaveBeenCalledWith(expect.objectContaining({ translationX: 180 }));
  });

  it("keeps imperative navigation and signed offsets logical in RTL", () => {
    setRTL(true);
    const ref = React.createRef<CarouselRef>();
    const offset = { value: 0 } as SharedValue<number>;
    render(<TestCarousel ref={ref} scrollOffsetValue={offset} />);

    act(() => ref.current?.next({ animated: false }));

    expect(offset.value).toBe(-300);
    expect(ref.current?.getCurrentIndex()).toBe(1);
  });

  it("uses itemSize as the page size", () => {
    const ref = React.createRef<CarouselRef>();
    const offset = { value: 0 } as SharedValue<number>;
    render(
      <TestCarousel
        ref={ref}
        itemSize={240}
        scrollOffsetValue={offset}
        style={{ width: 480, height: 200 }}
      />
    );

    act(() => ref.current?.next({ animated: false }));
    expect(offset.value).toBe(-240);
  });

  it("applies itemAnimation with the raw item index", () => {
    const itemAnimation = jest.fn(() => ({ opacity: 0.5 }));
    const screen = render(<TestCarousel itemAnimation={itemAnimation} />);

    expect(screen.getByTestId("item-0")).toBeTruthy();
    expect(itemAnimation).toHaveBeenCalledWith(expect.any(Number), 0);
  });

  it("hides every non-current slide from the accessibility tree", () => {
    const screen = render(<TestCarousel defaultIndex={1} />);
    const findSlide = (index: number) =>
      screen.UNSAFE_root.find((node) => node.props.testID === `__CAROUSEL_ITEM_${index}__`);

    expect(findSlide(1).props.importantForAccessibility).toBe("auto");
    expect(findSlide(0).props.importantForAccessibility).toBe("no-hide-descendants");
    expect(findSlide(0).props.accessibilityElementsHidden).toBe(true);
    expect(findSlide(0).props["aria-hidden"]).toBe(true);
  });

  it("removes protected content styles and warns once", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const screen = render(
      <TestCarousel
        contentContainerStyle={{ padding: 12, opacity: 0.2, transform: [{ scale: 2 }] } as never}
      />
    );
    const style = screen.getByTestId("carousel-content-container").props.style;

    expect(style).toEqual(expect.arrayContaining([{ padding: 12 }]));
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("preserves renderItem identity fields under auto-fill", () => {
    const seen: Array<[string, number]> = [];
    render(
      <Carousel
        data={["A"]}
        loop
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          seen.push([item, index]);
          return <View testID={`single-${index}`} />;
        }}
        style={{ width: 300, height: 200 }}
      />
    );

    expect(seen).toEqual([
      ["A", 0],
      ["A", 0],
      ["A", 0],
    ]);
  });

  it("reconciles keyed selection without emitting lifecycle callbacks", () => {
    const ref = React.createRef<CarouselRef>();
    const onScrollStart = jest.fn();
    const onSnapToItem = jest.fn();
    const offset = { value: 0 } as SharedValue<number>;
    const renderItem = ({ item }: { item: { id: string } }) => <View testID={`keyed-${item.id}`} />;
    const first = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const screen = render(
      <Carousel
        ref={ref}
        data={first}
        defaultIndex={1}
        keyExtractor={(item) => item.id}
        onScrollStart={onScrollStart}
        onSnapToItem={onSnapToItem}
        renderItem={renderItem}
        scrollOffsetValue={offset}
        style={{ width: 300, height: 200 }}
      />
    );

    const reordered = [first[1], first[0], first[2]];
    screen.rerender(
      <Carousel
        ref={ref}
        data={reordered}
        defaultIndex={1}
        keyExtractor={(item) => item.id}
        onScrollStart={onScrollStart}
        onSnapToItem={onSnapToItem}
        renderItem={renderItem}
        scrollOffsetValue={offset}
        style={{ width: 300, height: 200 }}
      />
    );

    expect(offset.value).toBe(0);
    expect(ref.current?.getCurrentIndex()).toBe(0);
    expect(onScrollStart).not.toHaveBeenCalled();
    expect(onSnapToItem).not.toHaveBeenCalled();
  });
});

describe("layout sizing helpers", () => {
  it("resolves automatic and explicit carousel dimensions", () => {
    expect(
      resolveCarouselLayoutStyle({
        flattenedStyle: { height: 200 },
        isVertical: false,
        measuredSize: 350,
        sizeExplicit: false,
      })
    ).toEqual({ width: "100%", height: 200 });

    expect(
      resolveCarouselLayoutStyle({
        flattenedStyle: { height: 200 },
        isVertical: false,
        measuredSize: 240,
        sizeExplicit: true,
      })
    ).toEqual({ width: 240, height: 200 });
  });

  it("resolves item size by explicit, effective, measured, then percentage order", () => {
    expect(
      resolveItemMainAxisSize({ explicitSize: 200, effectivePageSize: 300, measuredSize: 400 })
    ).toBe(200);
    expect(resolveItemMainAxisSize({ effectivePageSize: 300, measuredSize: 400 })).toBe(300);
    expect(resolveItemMainAxisSize({ measuredSize: 400 })).toBe(400);
    expect(resolveItemMainAxisSize({ measuredSize: null })).toBe("100%");
  });
});
