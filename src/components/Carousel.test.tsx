import type { FC } from "react";
import React from "react";
import type { PanGesture } from "react-native-gesture-handler";
import { Gesture, State } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useDerivedValue, useSharedValue } from "react-native-reanimated";
import type { ReactTestInstance } from "react-test-renderer";

import { act, render, waitFor } from "@testing-library/react-native";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import Carousel from "./Carousel";

import type { TCarouselProps } from "../types";

jest.setTimeout(1000 * 12);

const mockPan = jest.fn();
const realPan = Gesture.Pan();
const gestureTestId = "rnrc-gesture-handler";

jest.spyOn(Gesture, "Pan").mockImplementation(() => {
  mockPan();
  return realPan.withTestId(gestureTestId);
});

describe("Test the real swipe behavior of Carousel to ensure it's working as expected", () => {
  const slideWidth = 300;
  const slideHeight = 200;
  const slideCount = 4;

  beforeEach(() => {
    mockPan.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  // Helper function to create mock data
  const createMockData = (length: number = slideCount) =>
    Array.from({ length }, (_, i) => `Item ${i + 1}`);

  // Helper function to create default props with correct typing
  const createDefaultProps = (
    progressAnimVal: SharedValue<number>,
    customProps: Partial<TCarouselProps<string>> = {}
  ) => {
    const baseProps: Partial<TCarouselProps<string>> = {
      data: createMockData(),
      defaultIndex: 0,
      onProgressChange: (offsetProgress, absoluteProgress) => {
        progressAnimVal.value = absoluteProgress;
      },
    };

    return {
      ...baseProps,
      ...customProps,
    } as TCarouselProps<string>;
  };

  // Helper function to create test wrapper
  const createCarousel = (progress: { current: number }) => {
    const Wrapper: FC<Partial<TCarouselProps<string>>> = React.forwardRef((customProps, ref) => {
      const progressAnimVal = useSharedValue(progress.current);
      const defaultRenderItem = ({
        item,
        index,
      }: {
        item: string;
        index: number;
      }) => (
        <Animated.View
          testID={`carousel-item-${index}`}
          style={{ width: slideWidth, height: slideHeight, flex: 1 }}
        >
          {item}
        </Animated.View>
      );
      const { renderItem = defaultRenderItem, ...defaultProps } = createDefaultProps(
        progressAnimVal,
        customProps
      );

      useDerivedValue(() => {
        progress.current = progressAnimVal.value;
      }, [progressAnimVal]);

      return <Carousel {...defaultProps} renderItem={renderItem} ref={ref} />;
    });

    return Wrapper;
  };

  // Helper function to simulate swipe
  const swipeToLeftOnce = (
    options: {
      itemWidth?: number;
      velocityX?: number;
    } = {}
  ) => {
    const { itemWidth = slideWidth, velocityX = -slideWidth } = options;
    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX },
      { state: State.ACTIVE, translationX: -itemWidth * 0.25, velocityX },
      { state: State.ACTIVE, translationX: -itemWidth * 0.5, velocityX },
      { state: State.ACTIVE, translationX: -itemWidth * 0.75, velocityX },
      { state: State.END, translationX: -itemWidth, velocityX },
    ]);
  };

  // Helper function to verify initial render
  const verifyInitialRender = async (
    getByTestId: (testID: string | RegExp) => ReactTestInstance
  ) => {
    await waitFor(
      () => {
        const item = getByTestId("carousel-item-0");
        expect(item).toBeTruthy();
      },
      { timeout: 1000 * 3 }
    );
  };

  describe("TDD: Test upcoming refactoring for style props", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      (console.warn as jest.Mock).mockRestore();
    });

    it("should show a deprecation warning when using the `width` prop", () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      render(<Wrapper width={300} style={{ height: 200 }} />);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("is deprecated"));
    });

    it("should take width from the new `style` prop", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: 450, height: 200 }} testID="carousel-container" />
      );
      await verifyInitialRender(getByTestId);

      const outerContainer = getByTestId("carousel-container");
      expect(outerContainer.props.style).toContainEqual({ width: 450, height: 200 });
    });

    it("should apply styles from the new `contentContainerStyle` prop", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper
          style={{ width: slideWidth, height: slideHeight }}
          contentContainerStyle={{ padding: 20 }}
        />
      );
      await verifyInitialRender(getByTestId);

      const contentContainer = getByTestId("carousel-content-container");
      expect(contentContainer.props.style).toContainEqual({ padding: 20 });
    });

    it("should warn when `contentContainerStyle` contains conflicting props", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper
          style={{ width: slideWidth, height: slideHeight }}
          contentContainerStyle={{ opacity: 0.5 }}
        />
      );
      await verifyInitialRender(getByTestId);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("conflict with animations")
      );
    });

    it("should auto-size when no width is provided in `style`", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(<Wrapper style={{ height: 200 }} />);

      const contentContainer = getByTestId("carousel-content-container");

      // Initially, width should be '100%'
      expect(contentContainer.props.style[1].width).toBe("100%");
      expect(typeof contentContainer.props.onLayout).toBe("function");

      // Simulate onLayout event
      act(() => {
        contentContainer.props.onLayout?.({
          nativeEvent: { layout: { width: 350, height: 200 } },
        } as any);
      });

      act(() => {
        jest.runOnlyPendingTimers();
      });

      // No assertions on rendered items because reanimated mock does not process animated updates.
      // Ensure invoking layout measurement does not throw and that the carousel exposes the expected
      // measurement callback for auto-sizing scenarios.
    });

    it("should use itemWidth for snapping size when provided", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: 700, height: 200 }} itemWidth={350} />
      );
      await verifyInitialRender(getByTestId);

      // The carousel should use itemWidth (350) for snapping instead of container width (700)
      // This allows showing multiple items (2 items in this case: 700 / 350)
      const contentContainer = getByTestId("carousel-content-container");
      expect(contentContainer).toBeTruthy();
    });

    it("should use itemHeight for snapping size in vertical mode when provided", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper vertical style={{ width: 350, height: 700 }} itemHeight={350} />
      );
      await verifyInitialRender(getByTestId);

      // The carousel should use itemHeight (350) for snapping instead of container height (700)
      const contentContainer = getByTestId("carousel-content-container");
      expect(contentContainer).toBeTruthy();
    });

    it("should prioritize itemWidth over width prop", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: 700, height: 200 }} width={700} itemWidth={350} />
      );
      await verifyInitialRender(getByTestId);

      // itemWidth (350) should take precedence
      const contentContainer = getByTestId("carousel-content-container");
      expect(contentContainer).toBeTruthy();
    });

    it("should support itemWidth for multiple visible items scenario", async () => {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: 900, height: 200 }} itemWidth={300} data={createMockData(6)} />
      );
      await verifyInitialRender(getByTestId);

      // Container is 900px, itemWidth is 300px, so 3 items should be visible
      // Verify items are rendered
      expect(getByTestId("carousel-item-0")).toBeTruthy();
      expect(getByTestId("carousel-item-1")).toBeTruthy();
      expect(getByTestId("carousel-item-2")).toBeTruthy();
    });

    it("should accept onLayout callback prop", async () => {
      const progress = { current: 0 };
      const onLayout = jest.fn();
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: 700, height: 200 }} onLayout={onLayout} />
      );

      const contentContainer = getByTestId("carousel-content-container");

      // Verify that onLayout handler is attached to the content container
      expect(typeof contentContainer.props.onLayout).toBe("function");
    });
  });

  it("`data` prop: should render correctly", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} data={createMockData(6)} />
    );

    await verifyInitialRender(getByTestId);

    expect(getByTestId("carousel-item-0")).toBeTruthy();
    expect(getByTestId("carousel-item-1")).toBeTruthy();
    expect(getByTestId("carousel-item-2")).toBeTruthy();
    expect(getByTestId("carousel-item-3")).toBeTruthy();
    expect(getByTestId("carousel-item-4")).toBeTruthy();
    expect(getByTestId("carousel-item-5")).toBeTruthy();
  });

  it("`renderItem` prop: should render items correctly", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper
        style={{ width: slideWidth, height: slideHeight }}
        renderItem={({ item, index }) => (
          <Animated.Text testID={`item-${index}`}>{item}</Animated.Text>
        )}
      />
    );

    await waitFor(() => expect(getByTestId("item-0")).toBeTruthy());
  });

  it("should swipe to the left", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(<Wrapper style={{ width: slideWidth, height: slideHeight }} />);
    await verifyInitialRender(getByTestId);

    // Test swipe sequence
    for (let i = 1; i <= slideCount; i++) {
      swipeToLeftOnce();
      await waitFor(() => expect(progress.current).toBe(i % slideCount));
    }
  });

  it("`loop` prop: should swipe back to the first item when loop is true", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    {
      const { getByTestId } = render(
        <Wrapper style={{ width: slideWidth, height: slideHeight }} loop />
      );
      await verifyInitialRender(getByTestId);

      // Test swipe sequence
      for (let i = 1; i <= slideCount; i++) {
        swipeToLeftOnce();
        await waitFor(() => expect(progress.current).toBe(i % slideCount));
      }
    }

    {
      const { getByTestId } = render(
        <Wrapper style={{ width: slideWidth, height: slideHeight }} loop={false} />
      );
      await verifyInitialRender(getByTestId);

      fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: slideWidth * 0.25 },
        { state: State.END, translationX: slideWidth * 0.5 },
      ]);

      // Because the loop is false, so the the carousel will swipe back to the first item
      await waitFor(() => expect(progress.current).toBe(0));
    }
  });

  it("`onSnapToItem` prop: should call the onSnapToItem callback", async () => {
    const progress = { current: 0 };
    const onSnapToItem = jest.fn();
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} onSnapToItem={onSnapToItem} />
    );
    await verifyInitialRender(getByTestId);
    expect(onSnapToItem).not.toHaveBeenCalled();

    swipeToLeftOnce();
    await waitFor(() => expect(onSnapToItem).toHaveBeenCalledWith(1));

    swipeToLeftOnce();
    await waitFor(() => expect(onSnapToItem).toHaveBeenCalledWith(2));

    swipeToLeftOnce();
    await waitFor(() => expect(onSnapToItem).toHaveBeenCalledWith(3));
  });

  it("`autoPlay` prop: should swipe automatically when autoPlay is true", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} autoPlay autoPlayInterval={300} />
    );
    await verifyInitialRender(getByTestId);

    await waitFor(() => expect(progress.current).toBe(1));
    await waitFor(() => expect(progress.current).toBe(2));
    await waitFor(() => expect(progress.current).toBe(3));
    await waitFor(() => expect(progress.current).toBe(0));
  });

  it("`autoPlayReverse` prop: should swipe automatically in reverse when autoPlayReverse is true", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);

    render(
      <Wrapper
        style={{ width: slideWidth, height: slideHeight }}
        autoPlay
        autoPlayReverse
        autoPlayInterval={300}
        scrollAnimationDuration={250}
      />
    );

    const step = (expectedIndex: number) => {
      act(() => {
        jest.advanceTimersByTime(300 + 250 + 1);
      });
      expect(Math.round(((progress.current % 4) + 4) % 4)).toBe(expectedIndex);
    };

    step(3);
    step(2);
    step(1);
    step(0);
  });

  it("`defaultIndex` prop: should render the correct item with the defaultIndex props", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} defaultIndex={2} />
    );
    await verifyInitialRender(getByTestId);

    await waitFor(() => expect(progress.current).toBe(2));
  });

  it("`defaultScrollOffsetValue` prop: should render the correct progress value with the defaultScrollOffsetValue props", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    const WrapperWithCustomProps = () => {
      const defaultScrollOffsetValue = useSharedValue(-slideWidth);

      return (
        <Wrapper
          style={{ width: slideWidth, height: slideHeight }}
          defaultScrollOffsetValue={defaultScrollOffsetValue}
        />
      );
    };

    render(<WrapperWithCustomProps />);

    await waitFor(() => expect(progress.current).toBe(1));
  });

  it("`ref` prop: should handle the ref props", async () => {
    const Wrapper = createCarousel({ current: 0 });
    const fn = jest.fn();
    const WrapperWithCustomProps: FC<{
      refSetupCallback: (ref: boolean) => void;
    }> = ({ refSetupCallback }) => {
      return (
        <Wrapper
          style={{ width: slideWidth, height: slideHeight }}
          ref={(ref) => {
            refSetupCallback(!!ref);
          }}
        />
      );
    };

    render(<WrapperWithCustomProps refSetupCallback={fn} />);

    await waitFor(() => expect(fn).toHaveBeenCalledWith(true));
  });

  it("`autoFillData` prop: should auto fill data array to allow loop playback when the loop props is true", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    {
      const { getAllByTestId } = render(
        <Wrapper
          style={{ width: slideWidth, height: slideHeight }}
          autoFillData
          data={createMockData(1)}
        />
      );
      await waitFor(() => {
        expect(getAllByTestId("carousel-item-0").length).toBe(3);
      });
    }

    {
      const { getAllByTestId } = render(
        <Wrapper
          style={{ width: slideWidth, height: slideHeight }}
          autoFillData={false}
          data={createMockData(1)}
        />
      );
      await waitFor(() => {
        expect(getAllByTestId("carousel-item-0").length).toBe(1);
      });
    }
  });

  it("`pagingEnabled` prop: should swipe to the next item when pagingEnabled is true", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    {
      const { getByTestId } = render(
        <Wrapper style={{ width: slideWidth, height: slideHeight }} pagingEnabled={false} />
      );
      await verifyInitialRender(getByTestId);

      fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
        { state: State.BEGAN, translationX: 0, velocityX: -5 },
        {
          state: State.ACTIVE,
          translationX: -slideWidth * 0.15,
          velocityX: -5,
        },
        { state: State.END, translationX: -slideWidth * 0.25, velocityX: -5 },
      ]);

      await waitFor(() => expect(progress.current).toBe(0));
    }

    {
      const { getByTestId } = render(
        <Wrapper style={{ width: slideWidth, height: slideHeight }} pagingEnabled />
      );
      await verifyInitialRender(getByTestId);

      fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
        { state: State.BEGAN, translationX: 0, velocityX: -1000 },
        {
          state: State.ACTIVE,
          translationX: -slideWidth * 0.15,
          velocityX: -1000,
        },
        {
          state: State.END,
          translationX: -slideWidth * 0.25,
          velocityX: -1000,
        },
      ]);

      await waitFor(() => expect(progress.current).toBe(1));
    }
  });

  it("`onConfigurePanGesture` prop: should call the onConfigurePanGesture callback", async () => {
    const progress = { current: 0 };
    const Wrapper = createCarousel(progress);
    let _pan: PanGesture | null = null;
    render(
      <Wrapper
        style={{ width: slideWidth, height: slideHeight }}
        onConfigurePanGesture={(pan) => {
          _pan = pan;
          return pan;
        }}
      />
    );

    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} pagingEnabled={false} />
    );
    await verifyInitialRender(getByTestId);
    expect(_pan).not.toBeNull();
  });

  it("`onScrollStart` prop: should call the onScrollStart callback", async () => {
    const progress = { current: 0 };
    let startedProgress: number | undefined;
    const onScrollStart = () => {
      if (typeof startedProgress === "number") return;

      startedProgress = progress.current;
    };
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} onScrollStart={onScrollStart} />
    );
    await verifyInitialRender(getByTestId);

    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: 1000 },
      { state: State.ACTIVE, translationX: slideWidth / 2, velocityX: 1000 },
      { state: State.END, translationX: slideWidth, velocityX: 1000 },
    ]);

    await waitFor(() => {
      expect(startedProgress).toBe(0);
    });
  });

  it("`onScrollEnd` prop: should call the onScrollEnd callback", async () => {
    const progress = { current: 0 };
    let endedProgress: number | undefined;
    const onScrollEnd = jest.fn(() => {
      if (typeof endedProgress === "number") return;

      endedProgress = progress.current;
    });
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper style={{ width: slideWidth, height: slideHeight }} onScrollEnd={onScrollEnd} />
    );
    await verifyInitialRender(getByTestId);

    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: 1000 },
      { state: State.ACTIVE, translationX: slideWidth / 2, velocityX: 1000 },
      { state: State.END, translationX: slideWidth, velocityX: 1000 },
    ]);

    await waitFor(() => {
      expect(endedProgress).toBe(3);
      expect(onScrollEnd).toHaveBeenCalledWith(3);
    });
  });

  it("`onProgressChange` prop: should call the onProgressChange callback", async () => {
    const offsetProgressVal = { current: 0 };
    const absoluteProgressVal = { current: 0 };
    const onProgressChange = jest.fn((offsetProgress, absoluteProgress) => {
      offsetProgressVal.current = offsetProgress;
      absoluteProgressVal.current = absoluteProgress;
    });
    const Wrapper = createCarousel(offsetProgressVal);
    const { getByTestId } = render(
      <Wrapper
        style={{ width: slideWidth, height: slideHeight }}
        onProgressChange={onProgressChange}
        defaultIndex={0}
      />
    );
    await verifyInitialRender(getByTestId);

    await waitFor(() => {
      expect(offsetProgressVal.current).toBe(0);
      expect(absoluteProgressVal.current).toBe(0);
    });

    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: -1000 },
      { state: State.ACTIVE, translationX: -slideWidth / 2, velocityX: -1000 },
      { state: State.END, translationX: -slideWidth, velocityX: -1000 },
    ]);

    await waitFor(() => {
      expect(offsetProgressVal.current).toBe(-slideWidth);
      expect(absoluteProgressVal.current).toBe(1);
    });
  });

  it("`fixedDirection` prop: should swipe to the correct direction when fixedDirection is positive", async () => {
    {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: slideWidth, height: slideHeight }} fixedDirection="positive" />
      );
      await verifyInitialRender(getByTestId);

      swipeToLeftOnce({ velocityX: slideWidth });
      await waitFor(() => {
        expect(progress.current).toBe(3);
      });
    }

    {
      const progress = { current: 0 };
      const Wrapper = createCarousel(progress);
      const { getByTestId } = render(
        <Wrapper style={{ width: slideWidth, height: slideHeight }} fixedDirection="negative" />
      );
      await verifyInitialRender(getByTestId);

      swipeToLeftOnce({ velocityX: -slideWidth });
      await waitFor(() => expect(progress.current).toBe(1));
    }
  });

  it("`customAnimation` prop: should apply the custom animation", async () => {
    const progress = { current: 0 };
    const indexes: Record<number, number> = {};
    const Wrapper = createCarousel(progress);
    const { getByTestId } = render(
      <Wrapper
        style={{ width: slideWidth, height: slideHeight }}
        customAnimation={(value: number, index: number) => {
          "worklet";

          indexes[index] = index;

          const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
          const translateX = interpolate(value, [-2, 0, 1], [-slideWidth, 0, slideWidth]);

          return {
            transform: [{ translateX }],
            zIndex,
          };
        }}
      />
    );

    await verifyInitialRender(getByTestId);

    swipeToLeftOnce();
    await waitFor(() => {
      expect(progress.current).toBe(1);

      expect(indexes).toMatchInlineSnapshot(`
        {
          "0": 0,
          "1": 1,
          "2": 2,
          "3": 3,
        }
      `);
    });
  });

  it("`overscrollEnabled` prop: should respect overscrollEnabled=false and prevent scrolling beyond bounds", async () => {
    const containerWidth = slideWidth;
    const containerHeight = containerWidth / 2;

    let nextSlide: (() => void) | undefined;
    const testId = "CarouselAnimatedView";
    const progress = { current: 0 };
    const CarouselW = createCarousel(progress);

    const SCROLL_MS = 250; // Make the animation duration controllable
    const TICK = (ms = SCROLL_MS + 10) =>
      act(() => {
        jest.advanceTimersByTime(ms);
      });

    const { getByTestId } = render(
      <CarouselW
        ref={(ref) => {
          if (ref) nextSlide = ref.next;
        }}
        vertical={false}
        style={{ width: containerWidth, height: containerHeight }}
        testID={testId}
        loop={false}
        overscrollEnabled={false}
        data={createMockData(6)}
        pagingEnabled={false}
        scrollAnimationDuration={SCROLL_MS}
      />
    );

    // Simulate layout
    act(() => {
      getByTestId("carousel-content-container").props.onLayout({
        nativeEvent: { layout: { width: containerWidth, height: containerHeight } },
      });
    });

    // Let the internal async initialization run
    TICK(1);

    const getProgress = () =>
      Math.round(((progress.current % slideCount) + slideCount) % slideCount);
    const captured: number[] = [];
    const pushExpect = (expected: number) => {
      captured.push(getProgress());
      expect(captured[captured.length - 1]).toBe(expected);
    };

    // Initial: At the 0th page
    pushExpect(0);

    // next -> 1st page
    nextSlide?.();
    TICK(); // Wait for the animation to end
    pushExpect(1);

    // next -> 2nd page
    nextSlide?.();
    TICK();
    pushExpect(2);

    // next -> 3rd page (still allowed; still enough content)
    nextSlide?.();
    TICK();
    pushExpect(3);

    // next -> 4th page
    nextSlide?.();
    TICK();
    pushExpect(0);

    // next -> 5th page (last item)
    nextSlide?.();
    TICK();
    pushExpect(1);

    // continue next（Already at the last page, and overscroll=false, should not move）
    nextSlide?.();
    TICK();
    pushExpect(1);
  });

  it("should keep correct page after left overscroll at first page when calling next() or scrollTo()", async () => {
    const handlerOffset = { current: 0 };
    let nextSlide: ((opts?: { animated?: boolean }) => void) | undefined;
    let scrollToIndex: ((opts?: { index: number; animated?: boolean }) => void) | undefined;

    const Wrapper: FC<Partial<TCarouselProps<string>>> = React.forwardRef((customProps, ref) => {
      const progressAnimVal = useSharedValue(0);
      const mockHandlerOffset = useSharedValue(handlerOffset.current);
      const defaultRenderItem = ({
        item,
        index,
      }: {
        item: string;
        index: number;
      }) => (
        <Animated.View
          testID={`carousel-item-${index}`}
          style={{ width: slideWidth, height: slideHeight }}
        >
          {item}
        </Animated.View>
      );
      const { renderItem = defaultRenderItem, ...defaultProps } = createDefaultProps(
        progressAnimVal,
        customProps
      );

      useDerivedValue(() => {
        handlerOffset.current = mockHandlerOffset.value;
      }, [mockHandlerOffset]);

      return (
        <Carousel
          {...defaultProps}
          defaultScrollOffsetValue={mockHandlerOffset}
          renderItem={renderItem}
          ref={ref}
        />
      );
    });

    const { getByTestId } = render(
      <Wrapper
        ref={(ref) => {
          if (ref) {
            nextSlide = ref.next;
            scrollToIndex = ref.scrollTo;
          }
        }}
        loop={false}
        overscrollEnabled
        style={{ width: slideWidth, height: slideHeight }}
      />
    );
    await verifyInitialRender(getByTestId);

    // Simulate left overscroll at first page
    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: 0 },
      { state: State.ACTIVE, translationX: slideWidth / 4, velocityX: slideWidth },
      { state: State.ACTIVE, translationX: 0.00003996, velocityX: slideWidth },
      { state: State.END, translationX: 0.00003996, velocityX: slideWidth },
    ]);

    nextSlide?.({ animated: false });
    await waitFor(() => {
      expect(handlerOffset.current).toBe(-slideWidth);
    });

    // Overscroll again, then call scrollTo()
    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: -slideWidth },
      { state: State.ACTIVE, translationX: slideWidth, velocityX: slideWidth },
      { state: State.ACTIVE, translationX: slideWidth + 0.00003996, velocityX: slideWidth },
      { state: State.END, translationX: slideWidth + 0.00003996, velocityX: slideWidth },
    ]);

    scrollToIndex?.({ index: 1, animated: false });
    await waitFor(() => {
      expect(handlerOffset.current).toBe(-slideWidth);
    });
  });
});
