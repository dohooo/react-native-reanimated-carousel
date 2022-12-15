import React from "react";

import type { TCarouselProps } from "../types";
import { computedFillDataWithAutoFillData } from "../utils/computedWithAutoFillData";

type TGetRequiredProps<P extends keyof TCarouselProps> = Record<
P,
Required<TCarouselProps>[P]
>;

export type TInitializeCarouselProps<T> = TCarouselProps<T> &
TGetRequiredProps<
| "defaultIndex"
| "loop"
| "width"
| "height"
| "scrollAnimationDuration"
| "autoPlayInterval"
| "autoFillData"
> & {
  // Raw data that has not been processed
  rawData: T[]
  dataLength: number
  rawDataLength: number
};

export function useInitProps<T>(
  props: TCarouselProps<T>,
): TInitializeCarouselProps<T> {
  const {
    defaultIndex = 0,
    data: rawData = [],
    loop = true,
    enabled = true,
    autoPlayInterval: _autoPlayInterval = 1000,
    scrollAnimationDuration = 500,
    style = {},
    panGestureHandlerProps = {},
    pagingEnabled = true,
    autoFillData = true,
    snapEnabled = props.enableSnap ?? true,
    width: _width,
    height: _height,
  } = props;

  const width = Math.round(_width || 0);
  const height = Math.round(_height || 0);
  const autoPlayInterval = Math.max(_autoPlayInterval, 0);

  const data = React.useMemo<T[]>(
    () => {
      return computedFillDataWithAutoFillData<T>({
        loop,
        autoFillData,
        data: rawData,
        dataLength: rawData.length,
      });
    },
    [rawData, loop, autoFillData],
  );

  const dataLength = data.length;
  const rawDataLength = rawData.length;

  if (props.mode === "vertical-stack" || props.mode === "horizontal-stack") {
    if (!props.modeConfig)
      props.modeConfig = {};

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
    panGestureHandlerProps,
    pagingEnabled,
    snapEnabled,
    width,
    height,
  };
}
