import * as React from "react";
import { View } from "react-native";
import { Gesture, MouseButton } from "react-native-gesture-handler";
import { makeMutable } from "react-native-reanimated";
import { Pagination as PaginationComponent } from "../src/components/Pagination";

import type {
  CarouselAnimation,
  CarouselItemAnimation,
  CarouselLayout,
  CarouselPanGesture,
  CarouselProps,
  CarouselRef,
  CarouselRenderItem,
  CarouselScrollToOptions,
  CarouselStepOptions,
  PaginationProps,
} from "../src/public-types";

type Item = { id: string };

const renderItem: CarouselRenderItem<Item> = ({ item, index, relativeProgress }) => {
  relativeProgress.value;
  return <View testID={`${item.id}-${index}`} />;
};

const baseCarouselProps = {
  data: [{ id: "one" }],
  renderItem,
} satisfies CarouselProps<Item>;

void baseCarouselProps;

const parallaxLayout = {
  type: "parallax",
  offset: 80,
  scale: 0.9,
  adjacentScale: 0.8,
} satisfies CarouselLayout;

const itemAnimation: CarouselItemAnimation = (relativeProgress) => ({
  opacity: 1 - Math.min(Math.abs(relativeProgress), 1),
});

const layoutProps = {
  ...baseCarouselProps,
  layout: parallaxLayout,
} satisfies CarouselProps<Item>;

const animationProps = {
  ...baseCarouselProps,
  itemAnimation,
} satisfies CarouselProps<Item>;

void layoutProps;
void animationProps;

const timing = {
  type: "timing",
  duration: 500,
} satisfies CarouselAnimation;

const spring = {
  type: "spring",
  stiffness: 120,
  damping: 16,
} satisfies CarouselAnimation;

void timing;
void spring;

// @ts-expect-error layout and itemAnimation are mutually exclusive
const invalidLayoutSelection: CarouselProps<Item> = {
  ...baseCarouselProps,
  layout: parallaxLayout,
  itemAnimation,
};

void invalidLayoutSelection;

const legacyProps: CarouselProps<Item> = {
  ...baseCarouselProps,
  // @ts-expect-error removed props are not accepted
  autoPlay: true,
};

void legacyProps;

declare const realPanGesture: ReturnType<typeof Gesture.Pan>;

const facadeFromRngh: CarouselPanGesture = realPanGesture;
const chainedFacade = facadeFromRngh
  .activeOffsetX([-10, 10])
  .minPointers(1)
  .enableTrackpadTwoFingerGesture(true)
  .hitSlop(8)
  .mouseButton(MouseButton.LEFT)
  .simultaneousWithExternalGesture(Gesture.Tap())
  .onBegin(() => {})
  .onStart(() => {})
  .onUpdate(() => {})
  .onChange(() => {})
  .onEnd(() => {})
  .onFinalize(() => {});

// @ts-expect-error Carousel owns reactive gesture enablement
chainedFacade.enabled(false);
// @ts-expect-error Carousel callbacks must remain UI-thread worklets
chainedFacade.runOnJS(true);
// @ts-expect-error Carousel owns gesture activation state
chainedFacade.manualActivation(true);

const stepOptions: CarouselStepOptions = { count: 2, animated: true };
const scrollOptions: CarouselScrollToOptions = { index: 2, animated: false };

declare const carouselRef: CarouselRef;
carouselRef.next(stepOptions);
carouselRef.prev();
carouselRef.scrollTo(scrollOptions);
carouselRef.getCurrentIndex();

// @ts-expect-error scrollTo index is required
carouselRef.scrollTo({ animated: true });
// @ts-expect-error relative count belongs to next/prev
carouselRef.scrollTo({ index: 1, count: 2 });
// @ts-expect-error completion callback was removed
carouselRef.next({ onFinished: () => {} });

const progress = makeMutable(0);

const decorativePagination = {
  count: 3,
  progress,
} satisfies PaginationProps;

const interactivePagination = {
  count: 3,
  progress,
  onPress: (_index: number) => {},
  getItemAccessibilityLabel: (index: number, count: number) => `Slide ${index + 1} of ${count}`,
} satisfies PaginationProps;

void decorativePagination;
void interactivePagination;

const interactiveSpread = {
  onPress: (_index: number) => {},
  getItemAccessibilityLabel: (index: number, count: number) => `Slide ${index + 1} of ${count}`,
} satisfies Pick<
  Extract<PaginationProps, { onPress: (index: number) => void }>,
  "getItemAccessibilityLabel" | "onPress"
>;

const paginationElements = (
  <>
    <PaginationComponent {...decorativePagination} />
    <PaginationComponent count={3} progress={progress} {...interactiveSpread} />
  </>
);

void paginationElements;

// @ts-expect-error labels are only valid for interactive Pagination
const invalidDecorativePagination: PaginationProps = {
  count: 3,
  progress,
  getItemAccessibilityLabel: (index: number) => `Slide ${index + 1}`,
};

void invalidDecorativePagination;

const invalidGenericPagination = (
  // @ts-expect-error Pagination is positional and has no item generic
  <PaginationComponent<Item> count={3} progress={progress} onPress={() => {}} />
);

void invalidGenericPagination;

const invalidProtectedPaginationStyle: PaginationProps = {
  count: 3,
  progress,
  // @ts-expect-error Pagination owns its direction and orientation axis
  containerStyle: { flexDirection: "column" },
};

void invalidProtectedPaginationStyle;

declare const _reactElement: React.ReactElement;
void _reactElement;
