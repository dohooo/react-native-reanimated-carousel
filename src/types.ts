import type { CarouselProps, CarouselScrollToOptions, CarouselStepOptions } from "./public-types";

export type {
  CarouselAnimation,
  CarouselItemAnimation,
  CarouselLayout,
  CarouselPanGesture,
  CarouselProgressChangeHandler,
  CarouselProps,
  CarouselRef,
  CarouselRenderItem,
  CarouselRenderItemInfo,
  CarouselScrollToOptions,
  CarouselStepOptions,
  PaginationDotStyle,
  PaginationProps,
} from "./public-types";

/**
 * Internal command options retain a completion hook so autoplay can schedule
 * the next dwell period after a transition settles. This is never exported
 * from the package root.
 */
export type InternalCarouselStepOptions = CarouselStepOptions & {
  onFinished?: () => void;
};

export type InternalCarouselScrollToOptions = CarouselScrollToOptions & {
  onFinished?: () => void;
};

export type InternalCarouselProps<Item> = CarouselProps<Item>;
