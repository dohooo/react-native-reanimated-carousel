import React from "react";

import type { TCarouselProps } from "../types";
import { computedFillDataWithAutoFillData } from "../utils/computed-with-auto-fill-data";

type TGetRequiredProps<P extends keyof TCarouselProps> = Record<P, Required<TCarouselProps>[P]>;

export type TInitializeCarouselProps<T> = TCarouselProps<T> &
  TGetRequiredProps<
    "defaultIndex" | "loop" | "scrollAnimationDuration" | "autoPlayInterval" | "autoFillData"
  > & {
    // Raw data that has not been processed
    rawData: T[];
    dataLength: number;
    rawDataLength: number;
  };

export function useInitProps<T>(props: TCarouselProps<T>): TInitializeCarouselProps<T> {
  const {
    defaultIndex: requestedDefaultIndex = 0,
    data: rawData = [],
    loop = true,
    autoPlayInterval: _autoPlayInterval = 1000,
    scrollAnimationDuration = 500,
    style = {},
    autoFillData = true,
    // switchers
    enabled = true,
    pagingEnabled = true,
    overscrollEnabled = true,
    snapEnabled = props.enableSnap ?? true,
    width: _width,
    height: _height,
    itemWidth: _itemWidth,
    itemHeight: _itemHeight,
  } = props;

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

  const width = typeof _width === "number" ? Math.round(_width) : undefined;
  const height = typeof _height === "number" ? Math.round(_height) : undefined;
  const itemWidth = typeof _itemWidth === "number" && _itemWidth > 0 ? _itemWidth : undefined;
  const itemHeight = typeof _itemHeight === "number" && _itemHeight > 0 ? _itemHeight : undefined;
  const autoPlayInterval = Math.max(_autoPlayInterval, 0);

  const data = React.useMemo<T[]>(() => {
    return computedFillDataWithAutoFillData<T>({
      loop,
      autoFillData,
      data: rawData,
      dataLength: rawData.length,
    });
  }, [rawData, loop, autoFillData]);

  const dataLength = data.length;
  const rawDataLength = rawData.length;

  if (props.mode === "vertical-stack" || props.mode === "horizontal-stack") {
    if (!props.modeConfig) props.modeConfig = {};

    props.modeConfig.showLength = props.modeConfig?.showLength ?? dataLength - 1;
  }

  return {
    ...props,
    defaultIndex,
    autoFillData,
    // Fill data with autoFillData
    data,
    // Length of fill data
    dataLength,
    // Raw data that has not been processed
    rawData,
    // Length of raw data
    rawDataLength,
    loop,
    enabled,
    autoPlayInterval,
    scrollAnimationDuration,
    style,
    pagingEnabled,
    snapEnabled,
    overscrollEnabled,
    width,
    height,
    itemWidth,
    itemHeight,
  };
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
