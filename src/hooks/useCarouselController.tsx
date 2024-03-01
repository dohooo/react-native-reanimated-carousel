import React, { useRef } from "react";
import type Animated from "react-native-reanimated";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";

import { Easing } from "../constants";
import type {
  TCarouselActionOptions,
  TCarouselProps,
  WithTimingAnimation,
} from "../types";
import { computedRealIndexWithAutoFillData, convertToSharedIndex } from "../utils/computed-with-auto-fill-data";
import { dealWithAnimation } from "../utils/deal-with-animation";
import { handlerOffsetDirection } from "../utils/handleroffset-direction";
import { round } from "../utils/log";

interface IOpts {
  loop: boolean
  size: number
  dataLength: number
  handlerOffset: Animated.SharedValue<number>
  autoFillData: TCarouselProps["autoFillData"]
  withAnimation?: TCarouselProps["withAnimation"]
  fixedDirection?: TCarouselProps["fixedDirection"]
  duration?: number
  defaultIndex?: number
  onScrollStart?: () => void
  onScrollEnd?: () => void
  containerWidth: number
  overscrollEnabled?: boolean
}

export interface ICarouselController {
  getSharedIndex: () => number
  prev: (opts?: TCarouselActionOptions) => void
  next: (opts?: TCarouselActionOptions) => void
  getCurrentIndex: () => number
  scrollTo: (opts?: TCarouselActionOptions) => void
}

export function useCarouselController(options: IOpts): ICarouselController {
  const {
    size,
    loop,
    dataLength,
    handlerOffset,
    withAnimation,
    defaultIndex = 0,
    duration,
    autoFillData,
    fixedDirection,
    containerWidth,
    overscrollEnabled,
  } = options;

  const dataInfo = React.useMemo(
    () => ({
      length: dataLength,
      disable: !dataLength,
      originalLength: dataLength,
    }),
    [dataLength],
  );

  const index = useSharedValue<number>(defaultIndex);
  // The Index displayed to the user
  const sharedIndex = useRef<number>(defaultIndex);
  const sharedPreIndex = useRef<number>(defaultIndex);

  const currentFixedPage = React.useCallback(() => {
    if (loop)
      return -Math.round(handlerOffset.value / size);

    const fixed = (handlerOffset.value / size) % dataInfo.length;
    return Math.round(
      handlerOffset.value <= 0
        ? Math.abs(fixed)
        : Math.abs(fixed > 0 ? dataInfo.length - fixed : 0),
    );
  }, [handlerOffset, dataInfo, size, loop]);

  function setSharedIndex(newSharedIndex: number) {
    sharedIndex.current = newSharedIndex;
  }

  useAnimatedReaction(
    () => {
      const handlerOffsetValue = handlerOffset.value;
      const toInt = round(handlerOffsetValue / size) % dataInfo.length;
      const isPositive = handlerOffsetValue <= 0;
      const i = isPositive
        ? Math.abs(toInt)
        : Math.abs(toInt > 0 ? dataInfo.length - toInt : 0);

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
      runOnJS(setSharedIndex)(newSharedIndexValue);
    },
    [
      sharedPreIndex,
      sharedIndex,
      size,
      dataInfo,
      index,
      loop,
      autoFillData,
      handlerOffset,
    ],
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
    return !dataInfo.disable;
  }, [dataInfo]);

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
          runOnJS(onScrollEnd)();
          onFinished && runOnJS(onFinished)();
        }
      };

      const defaultWithAnimation: WithTimingAnimation = {
        type: "timing",
        config: { duration, easing: Easing.easeOutQuart },
      };

      return dealWithAnimation(withAnimation ?? defaultWithAnimation)(
        toValue,
        callback,
      );
    },
    [duration, withAnimation, onScrollEnd],
  );

  const next = React.useCallback(
    (opts: TCarouselActionOptions = {}) => {
      "worklet";
      const { count = 1, animated = true, onFinished } = opts;
      if (!canSliding() || (!loop && index.value >= dataInfo.length - 1))
        return;

      onScrollStart?.();

      const nextPage = currentFixedPage() + count;
      index.value = nextPage;
      let value = -nextPage * size;
      if (!loop && !overscrollEnabled) {
        value = Math.max(value, -(dataLength * size - containerWidth));
      }

      if (animated) {
        handlerOffset.value = scrollWithTiming(value, onFinished) as any;
      }
      else {
        handlerOffset.value = value;
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
    ],
  );

  const prev = React.useCallback(
    (opts: TCarouselActionOptions = {}) => {
      const { count = 1, animated = true, onFinished } = opts;
      /* Checking handlerOffset.value === 0 because if going to the next item doesn't
         clear the first element (can happen if overscrollEnabled = false), then we wouldn't 
         be allowed to go to the previous item
      */
      if (!canSliding() || (!loop && index.value <= 0 && handlerOffset.value === 0)) return;

      onScrollStart?.();

      const prevPage = currentFixedPage() - count;
      index.value = prevPage;

      let value = -prevPage * size;
      // Avoid overscrolling the first item
      if(!loop && value > 0){
        value = 0
      }

      if (animated) {
        handlerOffset.value = scrollWithTiming(
          value,
          onFinished,
        );
      }
      else {
        handlerOffset.value = value;
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
    ],
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
        isCloseToNextLoop
          = Math.abs(handlerOffset.value % totalSize) / totalSize
          >= 0.5;
      }

      const finalOffset
        = (Math.floor(Math.abs(handlerOffset.value / totalSize))
          + (isCloseToNextLoop ? 1 : 0))
        * totalSize
        * direction
        + offset;

      if (animated) {
        index.value = i;
        handlerOffset.value = scrollWithTiming(finalOffset, onFinished);
      }
      else {
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
    ],
  );

  const scrollTo = React.useCallback(
    (opts: TCarouselActionOptions = {}) => {
      const { index: i, count, animated = false, onFinished } = opts;
      if (typeof i === "number" && i > -1) {
        to({ i, animated, onFinished });
        return;
      }

      if (!count)
        return;

      const n = Math.round(count);

      if (n < 0)
        prev({ count: Math.abs(n), animated, onFinished });

      else
        next({ count: n, animated, onFinished });
    },
    [prev, next, to],
  );

  return {
    next,
    prev,
    scrollTo,
    getCurrentIndex,
    getSharedIndex: () => sharedIndex.current,
  };
}
