import React from "react";

import { Easing } from "../constants";
import type { CarouselAnimation, CarouselProps } from "../types";
import { computedFillDataWithAutoFillData } from "../utils/computed-with-auto-fill-data";

type CarouselSnapMode = NonNullable<CarouselProps<unknown>["snapMode"]>;

export type InitializedCarouselProps<Item> = Omit<
  CarouselProps<Item>,
  | "autoplay"
  | "autoplayDirection"
  | "autoplayInterval"
  | "data"
  | "defaultIndex"
  | "loop"
  | "orientation"
  | "overscrollEnabled"
  | "scrollEnabled"
  | "snapMode"
  | "style"
> & {
  autoplay: boolean;
  autoplayDirection: "forward" | "backward";
  autoplayInterval: number;
  data: Item[];
  defaultIndex: number;
  loop: boolean;
  orientation: "horizontal" | "vertical";
  overscrollEnabled: boolean;
  scrollEnabled: boolean;
  snapMode: CarouselSnapMode;
  style: NonNullable<CarouselProps<Item>["style"]>;
  animation: CarouselAnimation;
  rawData: Item[];
  dataLength: number;
  rawDataLength: number;
  autoFillData: true;
};

export function useInitProps<Item>(props: CarouselProps<Item>): InitializedCarouselProps<Item> {
  validateStaticProps(props);

  const rawData = props.data ?? [];
  const requestedDefaultIndex = props.defaultIndex ?? 0;
  const loop = props.loop ?? false;
  const autoplay = props.autoplay ?? false;
  const autoplayInterval = props.autoplayInterval ?? 3000;
  const autoplayDirection = props.autoplayDirection ?? "forward";
  const orientation = props.orientation ?? "horizontal";
  const scrollEnabled = props.scrollEnabled ?? true;
  const snapMode = props.snapMode ?? "page";
  const overscrollEnabled = props.overscrollEnabled ?? true;
  const style = props.style ?? {};
  const animation: CarouselAnimation = props.animation ?? {
    type: "timing",
    duration: 500,
    easing: Easing.easeOutQuart,
  };

  const defaultIndexState = React.useRef<{
    consumed: boolean;
    requested: number;
    resolved: number;
    warned: boolean;
  } | null>(null);

  if (!defaultIndexState.current) {
    if (rawData.length > 0) {
      assertValidDefaultIndex(requestedDefaultIndex, rawData.length);
    }

    defaultIndexState.current = {
      consumed: rawData.length > 0,
      requested: requestedDefaultIndex,
      resolved: rawData.length > 0 ? requestedDefaultIndex : 0,
      warned: false,
    };
  } else if (!defaultIndexState.current.consumed && rawData.length > 0) {
    const pendingIndex = defaultIndexState.current.requested;
    defaultIndexState.current.consumed = true;

    if (isValidDefaultIndex(pendingIndex, rawData.length)) {
      defaultIndexState.current.resolved = pendingIndex;
    } else {
      defaultIndexState.current.resolved = 0;
      if (__DEV__ && !defaultIndexState.current.warned) {
        console.warn(
          `[react-native-reanimated-carousel] Ignored defaultIndex ${pendingIndex} because it is outside the first non-empty data set.`
        );
        defaultIndexState.current.warned = true;
      }
    }
  }

  const defaultIndex = defaultIndexState.current.resolved;
  const data = React.useMemo(
    () =>
      computedFillDataWithAutoFillData({
        loop,
        autoFillData: true,
        data: rawData,
        dataLength: rawData.length,
      }),
    [loop, rawData]
  );

  return {
    ...props,
    autoplay,
    autoplayDirection,
    autoplayInterval,
    defaultIndex,
    loop,
    orientation,
    overscrollEnabled,
    scrollEnabled,
    snapMode,
    style,
    animation,
    data,
    rawData,
    dataLength: data.length,
    rawDataLength: rawData.length,
    autoFillData: true,
  };
}

function validateStaticProps<Item>(props: CarouselProps<Item>) {
  if (props.layout && props.itemAnimation) {
    throw new Error(
      "[react-native-reanimated-carousel] `layout` and `itemAnimation` are mutually exclusive."
    );
  }

  if (props.itemSize !== undefined && (!Number.isFinite(props.itemSize) || props.itemSize <= 0)) {
    throw new Error("[react-native-reanimated-carousel] itemSize must be a positive number.");
  }

  if (
    props.autoplayInterval !== undefined &&
    (!Number.isFinite(props.autoplayInterval) || props.autoplayInterval < 0)
  ) {
    throw new Error(
      "[react-native-reanimated-carousel] autoplayInterval must be a non-negative number."
    );
  }

  if (
    props.renderWindowSize !== undefined &&
    (!Number.isInteger(props.renderWindowSize) || props.renderWindowSize <= 0)
  ) {
    throw new Error(
      "[react-native-reanimated-carousel] renderWindowSize must be a positive integer."
    );
  }
}

function isValidDefaultIndex(defaultIndex: number, dataLength: number) {
  return Number.isInteger(defaultIndex) && defaultIndex >= 0 && defaultIndex < dataLength;
}

function assertValidDefaultIndex(defaultIndex: number, dataLength: number) {
  if (!isValidDefaultIndex(defaultIndex, dataLength)) {
    throw new Error(
      `[react-native-reanimated-carousel] defaultIndex must be an integer between 0 and ${dataLength - 1}.`
    );
  }
}
