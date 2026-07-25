import React, { useRef } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useGlobalState } from "../store";
import type {
  CarouselAnimation,
  CarouselRef,
  InternalCarouselScrollToOptions,
  InternalCarouselStepOptions,
} from "../types";
import {
  getLogicalProgress,
  getNearestLogicalPage,
  getSettledRawIndex,
  getShortestLoopTargetPage,
  positiveModulo,
} from "../utils/carousel-math";
import { dealWithAnimation } from "../utils/deal-with-animation";

interface CarouselControllerOptions {
  ref: React.ForwardedRef<CarouselRef>;
  loop: boolean;
  size: number;
  dataLength: number;
  rawDataLength: number;
  handlerOffset: SharedValue<number>;
  animation: CarouselAnimation;
  defaultIndex?: number;
  onScrollStart?: () => void;
  onMovementEnd?: (index: number) => void;
}

export interface CarouselController {
  getSharedIndex: () => number;
  prev: (options?: InternalCarouselStepOptions) => void;
  next: (options?: InternalCarouselStepOptions) => void;
  getCurrentIndex: () => number;
  scrollTo: (options: InternalCarouselScrollToOptions) => void;
  index: SharedValue<number>;
  startMovement: () => void;
  cancelMovement: () => void;
  settle: () => number;
}

export function useCarouselController(options: CarouselControllerOptions): CarouselController {
  const {
    animation,
    dataLength,
    defaultIndex = 0,
    handlerOffset,
    loop,
    rawDataLength,
    ref,
    size,
  } = options;
  const {
    common: {
      cancelMovement: cancelCommonMovement,
      dataRevision,
      isMoving,
      resolvedSize,
      settleMovement,
      sizePhase,
      startMovement: startCommonMovement,
    },
  } = useGlobalState();

  const index = useSharedValue(defaultIndex);
  const liveRawIndex = useRef(rawDataLength > 0 ? defaultIndex : 0);
  const settledIndex = useRef(rawDataLength > 0 ? defaultIndex : 0);
  const warnedCommands = useRef(new Set<string>());
  const canMove = rawDataLength > 1;

  const warnOnce = React.useCallback((key: string, message: string) => {
    if (!__DEV__ || warnedCommands.current.has(key)) return;
    warnedCommands.current.add(key);
    console.warn(`[react-native-reanimated-carousel] ${message}`);
  }, []);

  const currentVisualPage = React.useCallback(() => {
    if (size <= 0 || rawDataLength <= 0) return 0;

    const page = getNearestLogicalPage(handlerOffset.value, size);
    return loop ? page : Math.max(0, Math.min(rawDataLength - 1, page));
  }, [handlerOffset, loop, rawDataLength, size]);

  function setLiveRawIndex(nextIndex: number) {
    liveRawIndex.current = nextIndex;
  }

  useAnimatedReaction(
    () => {
      if (size <= 0 || dataLength <= 0 || rawDataLength <= 0) {
        return { physicalIndex: 0, rawIndex: 0 };
      }

      const page = getNearestLogicalPage(handlerOffset.value, size);
      return {
        physicalIndex: positiveModulo(page, dataLength),
        rawIndex: positiveModulo(page, rawDataLength),
      };
    },
    ({ physicalIndex, rawIndex }) => {
      index.value = physicalIndex;
      scheduleOnRN(setLiveRawIndex, rawIndex);
    },
    [dataLength, handlerOffset, index, rawDataLength, size]
  );

  const settle = React.useCallback(
    (targetIndex?: number) => {
      settleMovement();

      const nextSettledIndex =
        typeof targetIndex === "number" && rawDataLength > 0
          ? positiveModulo(Math.round(targetIndex), rawDataLength)
          : getSettledRawIndex(
              loop
                ? getLogicalProgress(handlerOffset.value, size)
                : Math.max(
                    0,
                    Math.min(rawDataLength - 1, getLogicalProgress(handlerOffset.value, size))
                  ),
              rawDataLength
            );

      settledIndex.current = nextSettledIndex;
      return nextSettledIndex;
    },
    [handlerOffset, loop, rawDataLength, settleMovement, size]
  );

  const getCurrentIndex = React.useCallback(() => settledIndex.current, []);
  const getSharedIndex = React.useCallback(() => liveRawIndex.current, []);
  const startMovement = React.useCallback(() => startCommonMovement(), [startCommonMovement]);
  const cancelMovement = React.useCallback(() => cancelCommonMovement(), [cancelCommonMovement]);

  React.useEffect(() => {
    if (!isMoving.value) settle();
  }, [dataRevision, isMoving, rawDataLength, settle]);

  const isReady = React.useCallback(() => {
    const currentSize = resolvedSize.value ?? size;
    return sizePhase.value === "ready" && currentSize > 0;
  }, [resolvedSize, size, sizePhase]);

  const emitStart = React.useCallback(() => {
    startMovement();
    options.onScrollStart?.();
  }, [options, startMovement]);

  const emitSettle = React.useCallback(
    (targetIndex?: number) => {
      const nextSettledIndex = settle(targetIndex);
      options.onMovementEnd?.(nextSettledIndex);
    },
    [options, settle]
  );

  const animateTo = React.useCallback(
    (targetOffset: number, targetIndex: number, onFinished?: () => void) => {
      "worklet";
      return dealWithAnimation(animation)(targetOffset, (finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(emitSettle, targetIndex);
          if (onFinished) scheduleOnRN(onFinished);
        } else {
          scheduleOnRN(cancelMovement);
        }
      });
    },
    [animation, cancelMovement, emitSettle]
  );

  const moveToPage = React.useCallback(
    (targetPage: number, animated: boolean, onFinished?: () => void) => {
      "worklet";
      const targetRawIndex = positiveModulo(targetPage, rawDataLength);
      emitStart();
      index.value = positiveModulo(targetPage, Math.max(dataLength, 1));

      const targetOffset = -targetPage * size;
      if (animated) {
        handlerOffset.value = animateTo(targetOffset, targetRawIndex, onFinished);
      } else {
        handlerOffset.value = targetOffset;
        emitSettle(targetRawIndex);
        onFinished?.();
      }
    },
    [animateTo, dataLength, emitSettle, emitStart, handlerOffset, index, rawDataLength, size]
  );

  const validateCount = React.useCallback(
    (command: "next" | "prev", count: number) => {
      if (count === 0) return false;
      if (Number.isInteger(count) && count > 0) return true;

      warnOnce(
        `${command}:count`,
        `${command} count must be a positive integer; received ${String(count)}.`
      );
      return false;
    },
    [warnOnce]
  );

  const next = React.useCallback(
    (stepOptions: InternalCarouselStepOptions = {}) => {
      "worklet";
      const { animated = true, count = 1, onFinished } = stepOptions;
      if (!canMove || !isReady() || !validateCount("next", count)) return;

      const currentPage = currentVisualPage();
      const targetPage = loop
        ? currentPage + count
        : Math.min(rawDataLength - 1, currentPage + count);
      if (targetPage === currentPage) return;

      moveToPage(targetPage, animated, onFinished);
    },
    [canMove, currentVisualPage, isReady, loop, moveToPage, rawDataLength, validateCount]
  );

  const prev = React.useCallback(
    (stepOptions: InternalCarouselStepOptions = {}) => {
      "worklet";
      const { animated = true, count = 1, onFinished } = stepOptions;
      if (!canMove || !isReady() || !validateCount("prev", count)) return;

      const currentPage = currentVisualPage();
      const targetPage = loop ? currentPage - count : Math.max(0, currentPage - count);
      if (targetPage === currentPage) return;

      moveToPage(targetPage, animated, onFinished);
    },
    [canMove, currentVisualPage, isReady, loop, moveToPage, validateCount]
  );

  const scrollTo = React.useCallback(
    (scrollOptions: InternalCarouselScrollToOptions) => {
      "worklet";
      const { animated = true, index: targetIndex, onFinished } = scrollOptions;
      if (!canMove || !isReady()) return;

      if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= rawDataLength) {
        warnOnce(
          "scrollTo:index",
          `scrollTo index must be an integer between 0 and ${rawDataLength - 1}; received ${String(targetIndex)}.`
        );
        return;
      }

      const currentPage = currentVisualPage();
      const currentRawIndex = positiveModulo(currentPage, rawDataLength);
      if (currentRawIndex === targetIndex) return;

      const targetPage = loop
        ? getShortestLoopTargetPage({
            currentPage,
            targetIndex,
            count: rawDataLength,
          })
        : targetIndex;
      moveToPage(targetPage, animated, onFinished);
    },
    [canMove, currentVisualPage, isReady, loop, moveToPage, rawDataLength, warnOnce]
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
    getSharedIndex,
    index,
    startMovement,
    cancelMovement,
    settle,
  };
}
