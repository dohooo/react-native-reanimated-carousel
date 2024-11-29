import type { StyleProp, ViewStyle } from "react-native";
import type { PanGesture } from "react-native-gesture-handler";
import type { SharedValue, WithSpringConfig, WithTimingConfig } from "react-native-reanimated";
import type Animated from "react-native-reanimated";

import type { TParallaxModeProps } from "./layouts/parallax";
import type { TStackModeProps } from "./layouts/stack";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type IComputedDirectionTypes<T, VP = {}, HP = {}> =
  | (T &
      VP & {
        /**
         * Layout items vertically instead of horizontally
         */
        vertical: true;
        /**
         * Layout items vertically instead of horizontally
         */
        /**
         * Specified carousel container width.
         */
        width?: number;
        height: number;
      })
  | (T &
      HP & {
        /**
         * Layout items vertically instead of horizontally
         */
        vertical?: false;
        /**
         * Layout items vertically instead of horizontally
         */
        /**
         * Specified carousel container width.
         */
        width: number;
        height?: number;
      });

export interface CustomConfig {
  type?: "negative" | "positive";
  viewCount?: number;
}

export interface WithSpringAnimation {
  type: "spring";
  config: WithSpringConfig;
}

export interface WithTimingAnimation {
  type: "timing";
  config: WithTimingConfig;
}

export type WithAnimation = WithSpringAnimation | WithTimingAnimation;

export type TCarouselProps<T = any> = {
  /**
   * @test_coverage ✅ tested in Carousel.test.tsx > should handle the ref props
   */
  ref?: React.Ref<ICarouselInstance>;
  /**
   * The default animated value of the carousel.
   * @test_coverage ✅ tested in Carousel.test.tsx > should render the correct progress value with the defaultScrollOffsetValue props
   */
  defaultScrollOffsetValue?: SharedValue<number>;
  /**
   * Carousel loop playback.
   * @default true
   * @test_coverage ✅ tested in Carousel.test.tsx > should swipe back to the first item when loop is true
   */
  loop?: boolean;
  /**
   * Carousel items data set.
   * @test_coverage ✅ tested in Carousel.test.tsx > should render correctly
   */
  data: T[];
  /**
   * Auto fill data array to allow loop playback when the loop props is true.
   * @default true
   * @example
   * [1] => [1, 1, 1]
   * [1, 2] => [1, 2, 1, 2]
   * @test_coverage ✅ tested in Carousel.test.tsx > should auto fill data array to allow loop playback when the loop props is true
   */
  autoFillData?: boolean;
  /**
   * Default index
   * @default 0
   * @test_coverage ✅ tested in Carousel.test.tsx > should render the correct item with the defaultIndex props
   */
  defaultIndex?: number;
  /**
   * Auto play
   * @test_coverage ✅ tested in Carousel.test.tsx > should swipe automatically when autoPlay is true
   */
  autoPlay?: boolean;
  /**
   * Auto play
   * @description reverse playback
   * @test_coverage ✅ tested in Carousel.test.tsx > should swipe automatically in reverse when autoPlayReverse is true
   */
  autoPlayReverse?: boolean;
  /**
   * Auto play
   * @description playback interval
   */
  autoPlayInterval?: number;
  /**
   * Time a scroll animation takes to finish
   * @default 500 (ms)
   */
  scrollAnimationDuration?: number;
  /**
   * Carousel content style
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Carousel container style
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * PanGesture config
   * @test_coverage ✅ tested in Carousel.test.tsx > should call the onConfigurePanGesture callback
   */
  onConfigurePanGesture?: (panGesture: PanGesture) => void;
  /**
   * Determines the maximum number of items will respond to pan gesture events,
   * windowSize={11} will active visible item plus up to 5 items above and 5 below the viewpor,
   * Reducing this number will reduce the calculation of the animation value and may improve performance.
   * @default 0 all items will respond to pan gesture events.
   */
  windowSize?: number;
  /**
   * When true, the scroll view stops on multiples of the scroll view's size when scrolling.
   * @default true
   * @test_coverage ✅ tested in Carousel.test.tsx > should swipe to the next item when pagingEnabled is true
   */
  pagingEnabled?: boolean;
  /**
   * If enabled, releasing the touch will scroll to the nearest item.
   * valid when pagingEnabled=false
   * @default true
   */
  snapEnabled?: boolean;
  /**
   * If enabled, items will scroll to the first placement when scrolling past the edge rather than closing to the last. (previous conditions: loop=false)
   * @default true
   * @test_coverage ✅ tested in Carousel.test.tsx > should respect overscrollEnabled=false and prevent scrolling beyond bounds
   */
  overscrollEnabled?: boolean;
  /**
   * If false, Carousel will not respond to any gestures.
   * @default true
   */
  enabled?: boolean;
  /**
   * Specifies the scrolling animation effect.
   */
  withAnimation?: WithAnimation;
  /**
   * Used to locate this view in end-to-end tests.
   */
  testID?: string;
  /**
   * Maximum offset value for once scroll.
   * Carousel cannot scroll over than this value.
   * */
  maxScrollDistancePerSwipe?: number;
  /**
   * Minimum offset value for once scroll.
   * If the translation value is less than this value, the carousel will not scroll.
   * */
  minScrollDistancePerSwipe?: number;
  /**
   * @experimental This API will be changed in the future.
   * If positive, the carousel will scroll to the positive direction and vice versa.
   * @test_coverage ✅ tested in Carousel.test.tsx > should swipe to the correct direction when fixedDirection is positive
   * */
  fixedDirection?: "positive" | "negative";
  /**
   * Custom carousel config.
   */
  customConfig?: () => CustomConfig;
  /**
   * Custom animations.
   * Must use `worklet`, Details: https://docs.swmansion.com/react-native-reanimated/docs/2.2.0/worklets/
   * @test_coverage ✅ tested in Carousel.test.tsx > should apply the custom animation
   */
  customAnimation?: (value: number, index: number) => ViewStyle;
  /**
   * Render carousel item.
   * @test_coverage ✅ tested in Carousel.test.tsx > should render items correctly
   */
  renderItem: CarouselRenderItem<T>;
  /**
   * Callback fired when navigating to an item.
   * @test_coverage ✅ tested in Carousel.test.tsx > should call the onSnapToItem callback
   */
  onSnapToItem?: (index: number) => void;
  /**
   * On scroll start
   * @test_coverage ✅ tested in Carousel.test.tsx > should call the onScrollStart callback
   */
  onScrollStart?: () => void;
  /**
   * On scroll end
   * @test_coverage ✅ tested in Carousel.test.tsx > should call the onScrollEnd callback
   */
  onScrollEnd?: (index: number) => void;
  /**
   * On progress change
   * @param offsetProgress Total of offset distance (0 390 780 ...)
   * @param absoluteProgress Convert to index (0 1 2 ...)
   * @test_coverage ✅ tested in Carousel.test.tsx > should call the onProgressChange callback
   *
   * If you want to update a shared value automatically, you can use the shared value as a parameter directly.
   */
  onProgressChange?:
    | ((offsetProgress: number, absoluteProgress: number) => void)
    | SharedValue<number>;

  // ============================== deprecated props ==============================
  /**
   * If enabled, releasing the touch will scroll to the nearest item.
   * valid when pagingEnabled=false
   * @deprecated please use snapEnabled instead
   */
  enableSnap?: boolean;
} & (TParallaxModeProps | TStackModeProps);

export interface ICarouselInstance {
  /**
   * Scroll to previous item, it takes one optional argument (count),
   * which allows you to specify how many items to cross
   */
  prev: (opts?: Omit<TCarouselActionOptions, "index">) => void;
  /**
   * Scroll to next item, it takes one optional argument (count),
   * which allows you to specify how many items to cross
   */
  next: (opts?: Omit<TCarouselActionOptions, "index">) => void;
  /**
   * Get current item index
   */
  getCurrentIndex: () => number;
  /**
   * Use value to scroll to a position where relative to the current position,
   * scrollTo({count: -2}) is equivalent to prev(2), scrollTo({count: 2}) is equivalent to next(2)
   */
  scrollTo: (opts?: TCarouselActionOptions) => void;
}

export interface CarouselRenderItemInfo<ItemT> {
  item: ItemT;
  index: number;
  animationValue: Animated.SharedValue<number>;
}

export type CarouselRenderItem<ItemT> = (info: CarouselRenderItemInfo<ItemT>) => React.ReactElement;

export interface TCarouselActionOptions {
  index?: number;
  count?: number;
  animated?: boolean;
  onFinished?: () => void;
}
