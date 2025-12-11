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
    defaultIndex = 0,
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
