import type { StyleProp, ViewStyle } from "react-native";
import type { PanGestureHandlerProps } from "react-native-gesture-handler";
import type {
  AnimatedStyleProp,
  SharedValue,
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";
import type Animated from "react-native-reanimated";

import type { TParallaxModeProps } from "./layouts/parallax";
import type { TStackModeProps } from "./layouts/stack";

export type IComputedDirectionTypes<T, VP = {}, HP = {}> =
    | (T &
    VP & {
      /**
               * Layout items vertically instead of horizontally
               */
      vertical: true
      /**
               * Layout items vertically instead of horizontally
               */
      /**
               * Specified carousel container width.
               */
      width?: number
      height: number
    })
    | (T &
    HP & {
      /**
               * Layout items vertically instead of horizontally
               */
      vertical?: false
      /**
               * Layout items vertically instead of horizontally
               */
      /**
               * Specified carousel container width.
               */
      width: number
      height?: number
    });

export interface CustomConfig {
  type?: "negative" | "positive"
  viewCount?: number
}

export interface WithSpringAnimation {
  type: "spring"
  config: WithSpringConfig
}

export interface WithTimingAnimation {
  type: "timing"
  config: WithTimingConfig
}

export type WithAnimation = WithSpringAnimation | WithTimingAnimation;

export type TCarouselProps<T = any> = {
  ref?: React.Ref<ICarouselInstance>
  /**
     * The default animated value of the carousel.
     */
  defaultScrollOffsetValue?: SharedValue<number>
  /**
     * Carousel loop playback.
     * @default true
     */
  loop?: boolean
  /**
     * Carousel items data set.
     */
  data: T[]
  /**
     * Auto fill data array to allow loop playback when the loop props is true.
     * @default true
     * @example
     * [1] => [1, 1, 1]
     * [1, 2] => [1, 2, 1, 2]
     */
  autoFillData?: boolean
  /**
     * Default index
     * @default 0
     */
  defaultIndex?: number
  /**
     * Auto play
     */
  autoPlay?: boolean
  /**
     * Auto play
     * @description reverse playback
     */
  autoPlayReverse?: boolean
  /**
     * Auto play
     * @description playback interval
     */
  autoPlayInterval?: number
  /**
     * Time a scroll animation takes to finish
     * @default 500 (ms)
     */
  scrollAnimationDuration?: number
  /**
     * Carousel container style
     */
  style?: StyleProp<ViewStyle>
  /**
     * PanGestureHandler props
     */
  panGestureHandlerProps?: Partial<
  Omit<PanGestureHandlerProps, "onHandlerStateChange" | "enabled">
  >
  /**
     * Determines the maximum number of items will respond to pan gesture events,
     * windowSize={11} will active visible item plus up to 5 items above and 5 below the viewpor,
     * Reducing this number will reduce the calculation of the animation value and may improve performance.
     * @default 0 all items will respond to pan gesture events.
     */
  windowSize?: number
  /**
     * When true, the scroll view stops on multiples of the scroll view's size when scrolling.
     * @default true
     */
  pagingEnabled?: boolean
  /**
     * If enabled, releasing the touch will scroll to the nearest item.
     * valid when pagingEnabled=false
     * @deprecated please use snapEnabled instead
     */
  enableSnap?: boolean
  /**
     * If enabled, releasing the touch will scroll to the nearest item.
     * valid when pagingEnabled=false
     * @default true
     */
  snapEnabled?: boolean
  /**
     * If false, Carousel will not respond to any gestures.
     * @default true
     */
  enabled?: boolean
  /**
     * Specifies the scrolling animation effect.
     */
  withAnimation?: WithAnimation
  /**
     * Used to locate this view in end-to-end tests.
     */
  testID?: string
  /**
     * Custom carousel config.
     */
  customConfig?: () => CustomConfig
  /**
     * Custom animations.
     * Must use `worklet`, Details: https://docs.swmansion.com/react-native-reanimated/docs/2.2.0/worklets/
     */
  customAnimation?: (value: number) => AnimatedStyleProp<ViewStyle>
  /**
     * Render carousel item.
     */
  renderItem: CarouselRenderItem<T>
  /**
     * Callback fired when navigating to an item.
     */
  onSnapToItem?: (index: number) => void
  /**
     * On scroll begin
     */
  onScrollBegin?: () => void
  /**
     * On scroll end
     */
  onScrollEnd?: (index: number) => void
  /**
     * On progress change
     * @param offsetProgress Total of offset distance (0 390 780 ...)
     * @param absoluteProgress Convert to index (0 1 2 ...)
     */
  onProgressChange?: (
    offsetProgress: number,
    absoluteProgress: number
  ) => void
} & (TParallaxModeProps | TStackModeProps);

export interface ICarouselInstance {
  /**
     * Scroll to previous item, it takes one optional argument (count),
     * which allows you to specify how many items to cross
     */
  prev: (opts?: Omit<TCarouselActionOptions, "index">) => void
  /**
     * Scroll to next item, it takes one optional argument (count),
     * which allows you to specify how many items to cross
     */
  next: (opts?: Omit<TCarouselActionOptions, "index">) => void
  /**
     * Get current item index
     */
  getCurrentIndex: () => number
  /**
     * Use value to scroll to a position where relative to the current position,
     * scrollTo(-2) is equivalent to prev(2), scrollTo(2) is equivalent to next(2)
     */
  scrollTo: (opts?: TCarouselActionOptions) => void
}

export interface CarouselRenderItemInfo<ItemT> {
  item: ItemT
  index: number
  animationValue: Animated.SharedValue<number>
}

export type CarouselRenderItem<ItemT> = (
  info: CarouselRenderItemInfo<ItemT>
) => React.ReactElement;

export interface TCarouselActionOptions {
  index?: number
  count?: number
  animated?: boolean
  onFinished?: () => void
}
