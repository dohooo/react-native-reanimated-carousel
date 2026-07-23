import type * as React from "react";
import type { ColorValue, LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import type {
  GestureStateChangeEvent,
  GestureType,
  GestureUpdateEvent,
  MouseButton,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
  PanGestureHandlerProps,
} from "react-native-gesture-handler";
import type { SharedValue, WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

type CarouselOrientation = "horizontal" | "vertical";
type CarouselSnapMode = "page" | "nearest" | "none";
type CarouselAutoplayDirection = "forward" | "backward";
type CarouselExitDirection = "left" | "right";

type CarouselContentContainerStyle = Omit<ViewStyle, "opacity" | "transform">;

type CarouselExternalGestureRef =
  | GestureType
  | React.RefObject<GestureType | undefined>
  | React.RefObject<React.ComponentType | undefined>;

type CarouselPanStateEvent = GestureStateChangeEvent<PanGestureHandlerEventPayload>;
type CarouselPanUpdateEvent = GestureUpdateEvent<PanGestureHandlerEventPayload>;
type CarouselPanChangeEvent = GestureUpdateEvent<
  PanGestureHandlerEventPayload & PanGestureChangeEventPayload
>;

type CarouselLayoutSelection =
  | {
      layout?: CarouselLayout;
      itemAnimation?: never;
    }
  | {
      layout?: never;
      itemAnimation: CarouselItemAnimation;
    };

type InteractivePaginationProps = {
  onPress: (index: number) => void;
  getItemAccessibilityLabel?: (index: number, count: number) => string;
};

type DecorativePaginationProps = {
  onPress?: never;
  getItemAccessibilityLabel?: never;
};

type ReadonlyProgressValue = Omit<SharedValue<number>, "modify" | "set" | "value"> & {
  readonly value: number;
};

type PaginationBaseProps = {
  count: number;
  progress: ReadonlyProgressValue;
  orientation?: CarouselOrientation;
  containerStyle?: StyleProp<ViewStyle>;
  dotStyle?: PaginationDotStyle;
  activeDotStyle?: PaginationDotStyle;
};

export type CarouselProps<Item> = {
  data: Item[];
  renderItem: CarouselRenderItem<Item>;
  keyExtractor?: (item: Item, index: number) => string;
  defaultIndex?: number;
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  autoplayDirection?: CarouselAutoplayDirection;
  orientation?: CarouselOrientation;
  itemSize?: number;
  scrollEnabled?: boolean;
  snapMode?: CarouselSnapMode;
  overscrollEnabled?: boolean;
  renderWindowSize?: number;
  animation?: CarouselAnimation;
  progress?: SharedValue<number>;
  onProgressChange?: CarouselProgressChangeHandler;
  scrollOffsetValue?: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<CarouselContentContainerStyle>;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  onConfigurePanGesture?: (gesture: CarouselPanGesture) => void;
  onScrollStart?: () => void;
  onSnapToItem?: (index: number) => void;
} & CarouselLayoutSelection;

export interface CarouselRef {
  prev(options?: CarouselStepOptions): void;
  next(options?: CarouselStepOptions): void;
  getCurrentIndex(): number;
  scrollTo(options: CarouselScrollToOptions): void;
}

export type CarouselRenderItem<Item> = (info: CarouselRenderItemInfo<Item>) => React.ReactElement;

export interface CarouselRenderItemInfo<Item> {
  item: Item;
  index: number;
  relativeProgress: SharedValue<number>;
}

export type CarouselProgressChangeHandler = (progress: number) => void;

export type CarouselLayout =
  | {
      type: "parallax";
      offset?: number;
      scale?: number;
      adjacentScale?: number;
    }
  | {
      type: "horizontal-stack";
      visibleCount?: number;
      exitDistance?: number;
      spacing?: number;
      scaleStep?: number;
      opacityStep?: number;
      rotation?: number;
      exitDirection?: CarouselExitDirection;
    }
  | {
      type: "vertical-stack";
      visibleCount?: number;
      exitDistance?: number;
      spacing?: number;
      scaleStep?: number;
      opacityStep?: number;
      rotation?: number;
      exitDirection?: CarouselExitDirection;
    };

export type CarouselAnimation =
  | ({ type: "timing" } & WithTimingConfig)
  | ({ type: "spring" } & WithSpringConfig);

export type CarouselItemAnimation = (relativeProgress: number, index: number) => ViewStyle;

/**
 * Supported configuration surface for Carousel's real RNGH pan gesture.
 *
 * Methods return this facade so chaining never exposes ownership-changing RNGH
 * methods such as `enabled`, `runOnJS`, or `manualActivation`.
 */
export interface CarouselPanGesture {
  activeOffsetX(offset: number | [start: number, end: number]): this;
  activeOffsetY(offset: number | [start: number, end: number]): this;
  failOffsetX(offset: number | [start: number, end: number]): this;
  failOffsetY(offset: number | [start: number, end: number]): this;
  minPointers(count: number): this;
  maxPointers(count: number): this;
  minDistance(distance: number): this;
  minVelocity(velocity: number): this;
  minVelocityX(velocity: number): this;
  minVelocityY(velocity: number): this;
  averageTouches(value: boolean): this;
  enableTrackpadTwoFingerGesture(value: boolean): this;
  activateAfterLongPress(duration: number): this;
  hitSlop(value: PanGestureHandlerProps["hitSlop"]): this;
  mouseButton(button: MouseButton): this;
  simultaneousWithExternalGesture(...gestures: CarouselExternalGestureRef[]): this;
  requireExternalGestureToFail(...gestures: CarouselExternalGestureRef[]): this;
  blocksExternalGesture(...gestures: CarouselExternalGestureRef[]): this;
  onBegin(callback: (event: CarouselPanStateEvent) => void): this;
  onStart(callback: (event: CarouselPanStateEvent) => void): this;
  onUpdate(callback: (event: CarouselPanUpdateEvent) => void): this;
  onChange(callback: (event: CarouselPanChangeEvent) => void): this;
  onEnd(callback: (event: CarouselPanStateEvent, success: boolean) => void): this;
  onFinalize(callback: (event: CarouselPanStateEvent, success: boolean) => void): this;
}

export interface CarouselStepOptions {
  count?: number;
  animated?: boolean;
}

export interface CarouselScrollToOptions {
  index: number;
  animated?: boolean;
}

export type PaginationProps = PaginationBaseProps &
  (InteractivePaginationProps | DecorativePaginationProps);

export interface PaginationDotStyle {
  width?: number;
  height?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: ColorValue;
  backgroundColor?: ColorValue;
  opacity?: number;
}
