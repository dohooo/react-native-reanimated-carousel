import React, { useRef } from "react";
import { SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Easing } from "../constants";
import { useGlobalState } from "../store";
import type {
  ICarouselInstance,
  TCarouselActionOptions,
  TCarouselProps,
  WithTimingAnimation,
} from "../types";
import {
  computedRealIndexWithAutoFillData,
  convertToSharedIndex,
} from "../utils/computed-with-auto-fill-data";
import { dealWithAnimation } from "../utils/deal-with-animation";
import { handlerOffsetDirection } from "../utils/handleroffset-direction";
import { round } from "../utils/log";

interface IOpts {
  ref: React.ForwardedRef<ICarouselInstance>;
  loop: boolean;
  size: number;
  dataLength: number;
  handlerOffset: SharedValue<number>;
  autoFillData: TCarouselProps["autoFillData"];
  withAnimation?: TCarouselProps["withAnimation"];
  fixedDirection?: TCarouselProps["fixedDirection"];
  duration?: number;
  defaultIndex?: number;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
}

export interface ICarouselController {
  getSharedIndex: () => number;
  prev: (opts?: TCarouselActionOptions) => void;
  next: (opts?: TCarouselActionOptions) => void;
  getCurrentIndex: () => number;
  scrollTo: (opts?: TCarouselActionOptions) => void;
  index: SharedValue<number>;
}

export function useCarouselController(options: IOpts): ICarouselController {
  const {
    ref,
    size,
    loop,
    dataLength,
    handlerOffset,
    withAnimation,
    defaultIndex = 0,
    duration,
    autoFillData,
    fixedDirection,
  } = options;

  const globalState = useGlobalState();

  const {
    props: { overscrollEnabled, vertical, width, height },
    layout: { containerSize },
    common: { sizePhase, resolvedSize },
  } = globalState;

  const dataInfo = React.useMemo(
    () => ({
      length: dataLength,
      disable: !dataLength,
      originalLength: dataLength,
    }),
    [dataLength]
  );

  const index = useSharedValue<number>(defaultIndex);
  // The Index displayed to the user
  const sharedIndex = useRef<number>(defaultIndex);
  const sharedPreIndex = useRef<number>(defaultIndex);

  const currentFixedPage = React.useCallback(() => {
    if (size <= 0) return 0;
    if (loop) return -Math.round(handlerOffset.value / size);

    const fixed = (handlerOffset.value / size) % dataInfo.length;
    return Math.round(
      handlerOffset.value <= 0 ? Math.abs(fixed) : Math.abs(fixed > 0 ? dataInfo.length - fixed : 0)
    );
  }, [handlerOffset, dataInfo, size, loop]);

  function setSharedIndex(newSharedIndex: number) {
    sharedIndex.current = newSharedIndex;
  }

  useAnimatedReaction(
    () => {
      if (size <= 0) {
        return {
          i: 0,
          newSharedIndexValue: 0,
        };
      }

      const handlerOffsetValue = handlerOffset.value;
      const toInt = round(handlerOffsetValue / size) % dataInfo.length;
      const isPositive = handlerOffsetValue <= 0;
      const i = isPositive ? Math.abs(toInt) : Math.abs(toInt > 0 ? dataInfo.length - toInt : 0);

      const newSharedIndexValue = convertToSharedIndex({
        loop,
        rawDataLength: dataInfo.originalLength,
        autoFillData: autoFillData!,
        index: i,
      });

      return {
        i,
        newSharedIndexValue,
      };
    },
    ({ i, newSharedIndexValue }) => {
      index.value = i;
      scheduleOnRN(setSharedIndex, newSharedIndexValue);
    },
    [sharedPreIndex, sharedIndex, size, dataInfo, index, loop, autoFillData, handlerOffset]
  );

  const getCurrentIndex = React.useCallback(() => {
    const realIndex = computedRealIndexWithAutoFillData({
      index: index.value,
      dataLength: dataInfo.originalLength,
      loop,
      autoFillData: autoFillData!,
    });

    return realIndex;
  }, [index, autoFillData, dataInfo, loop]);

  const canSliding = React.useCallback(() => {
    const currentSize = resolvedSize.value ?? size;
    const ready = sizePhase.value === "ready" && !!currentSize;

    return !dataInfo.disable && ready;
  }, [dataInfo, resolvedSize, sizePhase, size]);

  const onScrollEnd = React.useCallback(() => {
    options.onScrollEnd?.();
  }, [options]);

  const onScrollStart = React.useCallback(() => {
    options.onScrollStart?.();
  }, [options]);

  const scrollWithTiming = React.useCallback(
    (toValue: number, onFinished?: () => void) => {
      "worklet";
      const callback = (isFinished: boolean) => {
        "worklet";
        if (isFinished) {
          scheduleOnRN(onScrollEnd);
          onFinished && scheduleOnRN(onFinished);
        }
      };

      const defaultWithAnimation: WithTimingAnimation = {
        type: "timing",
        config: { duration, easing: Easing.easeOutQuart },
      };

      return dealWithAnimation(withAnimation ?? defaultWithAnimation)(toValue, callback);
    },
    [duration, withAnimation, onScrollEnd]
  );

  const next = React.useCallback(
    (opts: TCarouselActionOptions = {}) => {
      "worklet";
      const { count = 1, animated = true, onFinished } = opts;
      if (!canSliding()) return;

      if (!loop && index.value >= dataInfo.length - 1) return;

      /* 
      [Overscroll Protection Logic]
      
      This section handles the overscroll protection when overscrollEnabled is false.
      It prevents scrolling beyond the visible content area.

      Example scenario:
      - Container width: 300px
      - Item width: 75px (4 items per view)
      - Total items: 6
      
      Initial state (index = 0):
      [0][1][2][3] | [4][5]
      visible      | remaining

      After 2 slides (index = 2):
      [0][1] | [2][3][4][5]
      hidden | visible

      The visibleContentWidth calculation:
      - At index 2, remaining items = 4 (items 2,3,4,5)
      - visibleContentWidth = 4 * 75px = 300px
      
      If we try to slide again:
      - New visibleContentWidth would be: 2 * 75px = 150px (only items 4,5 remain)
      - Since 150px < container width (300px), the slide is prevented
      
      This ensures we don't scroll beyond the last set of fully visible items,
      maintaining a clean UX without partial item visibility at the edges.
      */
      // For overscroll calculation, use the intended item size, not the measured container size
      // In the new dynamic size system, `size` might be the container size from layout measurement,
      // but for overscroll we need the actual item size from the width/height props
      const itemSize = vertical ? height || size : width || size;
      const visibleContentWidth = (dataInfo.length - index.value) * itemSize;

      // Get effective container width, with fallback for cases where containerSize
      // hasn't been updated yet (e.g., in tests or during initialization)
      const getEffectiveContainerWidth = () => {
        // 1. Use measured value if available
        if (containerSize.value.width > 0) {
          return containerSize.value.width;
        }

        // 2. Fallback to props width/height when no measurement available
        if (!vertical && width && width > 0) {
          return width;
        }
        if (vertical && height && height > 0) {
          return height;
        }

        // 3. Final fallback - assume multiple items are visible
        return itemSize * 3; // Assume 3 items per view as reasonable default
      };

      const effectiveContainerWidth = getEffectiveContainerWidth();

      if (!overscrollEnabled && effectiveContainerWidth > 0) {
        if (!(visibleContentWidth > effectiveContainerWidth)) {
          return;
        }
      }

      onScrollStart?.();

      const nextPage = currentFixedPage() + count;
      index.value = nextPage;

      if (animated) {
        handlerOffset.value = scrollWithTiming(-nextPage * size, onFinished) as any;
      } else {
        handlerOffset.value = -nextPage * size;
        onFinished?.();
      }
    },
    [
      canSliding,
      loop,
      index,
      dataInfo,
      onScrollStart,
      handlerOffset,
      size,
      scrollWithTiming,
      currentFixedPage,
      overscrollEnabled,
      containerSize,
      vertical,
      width,
      height,
    ]
  );

  const prev = React.useCallback(
    (opts: TCarouselActionOptions = {}) => {
      const { count = 1, animated = true, onFinished } = opts;
      if (!canSliding()) return;

      if (!loop && index.value <= 0) return;

      onScrollStart?.();

      const prevPage = currentFixedPage() - count;
      index.value = prevPage;

      if (animated) {
        handlerOffset.value = scrollWithTiming(-prevPage * size, onFinished);
      } else {
        handlerOffset.value = -prevPage * size;
        onFinished?.();
      }
    },
    [
      canSliding,
      loop,
      index,
      onScrollStart,
      handlerOffset,
      size,
      scrollWithTiming,
      currentFixedPage,
    ]
  );

  const to = React.useCallback(
    (opts: { i: number; animated: boolean; onFinished?: () => void }) => {
      const { i, animated = false, onFinished } = opts;

      if (i === index.value) return;

      if (!canSliding()) return;

      onScrollStart?.();
      // direction -> 1 | -1
      const direction = handlerOffsetDirection(handlerOffset, fixedDirection);

      // target offset
      const offset = i * size * direction;
      // page width size * page count
      const totalSize = dataInfo.length * size;

      let isCloseToNextLoop = false;

      if (loop) {
        isCloseToNextLoop = Math.abs(handlerOffset.value % totalSize) / totalSize >= 0.5;
      }

      const finalOffset =
        (Math.floor(Math.abs(handlerOffset.value / totalSize)) + (isCloseToNextLoop ? 1 : 0)) *
          totalSize *
          direction +
        offset;

      if (animated) {
        index.value = i;
        handlerOffset.value = scrollWithTiming(finalOffset, onFinished);
      } else {
        handlerOffset.value = finalOffset;
        index.value = i;
        onFinished?.();
      }
    },
    [
      size,
      loop,
      index,
      fixedDirection,
      handlerOffset,
      dataInfo.length,
      canSliding,
      onScrollStart,
      scrollWithTiming,
    ]
  );

  const scrollTo = React.useCallback(
    (opts: TCarouselActionOptions = {}) => {
      const { index: i, count, animated = false, onFinished } = opts;

      if (typeof i === "number" && i > -1) {
        to({ i, animated, onFinished });
        return;
      }

      if (!count) return;

      const n = Math.round(count);

      if (n < 0) prev({ count: Math.abs(n), animated, onFinished });
      else next({ count: n, animated, onFinished });
    },
    [prev, next, to]
  );

  React.useImperativeHandle(
    ref,
    () => ({
      next,
      prev,
      getCurrentIndex,
      scrollTo,
    }),
    [getCurrentIndex, next, prev, scrollTo]
  );

  return {
    next,
    prev,
    scrollTo,
    getCurrentIndex,
    getSharedIndex: () => sharedIndex.current,
    index,
  };
}
