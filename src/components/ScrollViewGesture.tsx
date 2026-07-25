import type { PropsWithChildren } from "react";
import React, { useCallback } from "react";
import type { LayoutChangeEvent, ViewProps } from "react-native";
import type {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import type { AnimatedProps, SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { usePanGestureProxy } from "../hooks/usePanGestureProxy";
import { useGlobalState } from "../store";
import { toLogicalGestureValue } from "../utils/carousel-direction";
import { computeGestureTranslation } from "../utils/compute-gesture-translation";
import { dealWithAnimation } from "../utils/deal-with-animation";

interface Props {
  size: number;
  infinite?: boolean;
  testID?: string;
  style?: AnimatedProps<ViewProps>["style"];
  translation: SharedValue<number>;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onTouchBegin?: () => void;
  onTouchEnd?: () => void;
}

const IScrollViewGesture: React.FC<PropsWithChildren<Props>> = (props) => {
  const {
    props: {
      onConfigurePanGesture,
      orientation,
      snapMode,
      loop,
      animation,
      scrollEnabled,
      dataLength,
      overscrollEnabled,
      directionSign,
    },
    common: { size, resolvedSize, sizePhase, sizeExplicit },
    layout: { containerSize, updateContainerSize },
  } = useGlobalState();

  const {
    translation,
    testID,
    style = {},
    onScrollStart,
    onScrollEnd,
    onTouchBegin,
    onTouchEnd,
  } = props;
  const isVertical = orientation === "vertical";

  const maxPage = dataLength;
  const isHorizontal = useDerivedValue(() => !isVertical, [isVertical]);
  const max = useSharedValue(0);
  const panOffset = useSharedValue<number | undefined>(undefined); // set to undefined when not actively in a pan gesture
  const touching = useSharedValue(false);
  const validStart = useSharedValue(false);
  const hasStartedMovement = useSharedValue(false);
  const scrollEndTranslation = useSharedValue(0);
  const scrollEndVelocity = useSharedValue(0);
  const sizeReady = useDerivedValue(() => {
    const currentSize = resolvedSize.value ?? 0;
    return sizePhase.value === "ready" && currentSize > 0;
  }, [resolvedSize, sizePhase]);

  // Get the limit of the scroll.
  const getLimit = React.useCallback(() => {
    "worklet";

    if (size <= 0) return 0;

    if (!loop && !overscrollEnabled) {
      const containerMainAxisSize = isVertical
        ? containerSize.value.height
        : containerSize.value.width;

      // If the item's total size is less than the container's size, then there is no need to scroll.
      if (containerMainAxisSize <= 0 || dataLength * size < containerMainAxisSize) return 0;

      // Disable the "overscroll" effect
      return dataLength * size - containerMainAxisSize;
    }

    return dataLength * size;
  }, [loop, size, dataLength, overscrollEnabled, isVertical, containerSize]);

  const withSpring = React.useCallback(
    (toValue: number, onFinished?: () => void) => {
      "worklet";
      return dealWithAnimation(animation)(toValue, (isFinished: boolean) => {
        "worklet";
        if (isFinished) onFinished && scheduleOnRN(onFinished);
      });
    },
    [animation]
  );

  const endWithSpring = React.useCallback(
    (
      scrollEndTranslationValue: number,
      scrollEndVelocityValue: number,
      onFinished?: () => void
    ) => {
      "worklet";
      // Use resolvedSize.value (SharedValue) instead of size (React state)
      // to avoid race condition where sizeReady is true but size is still 0
      const currentSize = resolvedSize.value ?? 0;
      if (currentSize <= 0) {
        return;
      }
      const origin = translation.value;
      const velocity = scrollEndVelocityValue;
      // Default to scroll in the direction of the slide (with deceleration)
      let finalTranslation: number = withDecay({ velocity, deceleration: 0.999 }, (isFinished) => {
        if (isFinished && onFinished) scheduleOnRN(onFinished);
      });

      /**
       * The page size is the same as the item size.
       * If direction is vertical, the page size is the height of the item.
       * If direction is horizontal, the page size is the width of the item.
       *
       * `page size` equals to `currentSize` variable.
       */

      // Calculate target based on final pan position and velocity.
      const nextPage = -Math.round((origin + velocity * 2) / currentSize);

      if (snapMode === "page") {
        // we'll never go further than a single page away from the current page when paging
        // is enabled.

        // distance with direction
        const offset = -(scrollEndTranslationValue >= 0 ? 1 : -1); // 1 or -1
        const computed = offset < 0 ? Math.ceil : Math.floor;
        const page = computed(-origin / currentSize);

        const velocityDirection = -Math.sign(velocity);
        if (page === nextPage || velocityDirection !== offset) {
          // not going anywhere! Velocity was insufficient to overcome the distance to get to a
          // further page. Let's reset gently to the current page.
          finalTranslation = withSpring(withProcessTranslation(-page * currentSize), onFinished);
        } else if (loop) {
          const finalPage = page + offset;
          finalTranslation = withSpring(
            withProcessTranslation(-finalPage * currentSize),
            onFinished
          );
        } else {
          const finalPage = Math.min(maxPage - 1, Math.max(0, page + offset));
          finalTranslation = withSpring(
            withProcessTranslation(-finalPage * currentSize),
            onFinished
          );
        }
      }

      if (snapMode === "nearest") {
        finalTranslation = withSpring(withProcessTranslation(-nextPage * currentSize), onFinished);
      }

      translation.value = finalTranslation;

      function withProcessTranslation(translation: number) {
        if (!loop && !overscrollEnabled) {
          const limit = getLimit();
          return Math.min(0, Math.max(-limit, translation));
        }

        return translation;
      }
    },
    [withSpring, resolvedSize, maxPage, loop, snapMode, translation]
  );

  const onFinish = React.useCallback(
    (isFinished: boolean) => {
      "worklet";
      if (isFinished) {
        touching.value = false;
        onScrollEnd && scheduleOnRN(onScrollEnd);
      }
    },
    [onScrollEnd, touching]
  );

  const activeDecay = React.useCallback(() => {
    "worklet";
    touching.value = true;
    translation.value = withDecay({ velocity: scrollEndVelocity.value }, (isFinished) =>
      onFinish(isFinished as boolean)
    );
  }, [onFinish, scrollEndVelocity, touching, translation]);

  const resetBoundary = React.useCallback(() => {
    "worklet";
    // Use resolvedSize.value (SharedValue) instead of size (React state)
    // to avoid race condition where sizeReady is true but size is still 0
    const currentSize = resolvedSize.value ?? 0;
    if (currentSize <= 0) return;
    if (touching.value) return;

    if (translation.value > 0) {
      if (scrollEndTranslation.value < 0) {
        activeDecay();
        return;
      }
      if (!loop) {
        translation.value = withSpring(0);
        return;
      }
    }

    if (translation.value < -((maxPage - 1) * currentSize)) {
      if (scrollEndTranslation.value > 0) {
        activeDecay();
        return;
      }
      if (!loop) translation.value = withSpring(-((maxPage - 1) * currentSize));
    }
  }, [touching, translation, resolvedSize, scrollEndTranslation, loop, activeDecay, withSpring]);

  useAnimatedReaction(
    () => translation.value,
    () => {
      if (snapMode !== "page") resetBoundary();
    },
    [resetBoundary, snapMode]
  );

  const onGestureStart = useCallback(
    (_: PanGestureHandlerEventPayload) => {
      "worklet";
      // Use resolvedSize.value (SharedValue) instead of size (React state)
      // to avoid race condition where sizeReady is true but size is still 0
      const currentSize = resolvedSize.value ?? 0;
      if (!sizeReady.value || currentSize <= 0) {
        return;
      }
      touching.value = true;
      validStart.value = true;
      hasStartedMovement.value = false;

      max.value = (maxPage - 1) * currentSize;
      if (!loop && !overscrollEnabled) max.value = getLimit();

      panOffset.value = translation.value;
    },
    [
      max,
      maxPage,
      loop,
      touching,
      panOffset,
      validStart,
      translation,
      overscrollEnabled,
      getLimit,
      hasStartedMovement,
      sizeReady,
      resolvedSize,
    ]
  );

  const onGestureUpdate = useCallback(
    (e: PanGestureHandlerEventPayload) => {
      "worklet";
      const currentSize = resolvedSize.value ?? 0;
      if (!sizeReady.value || currentSize <= 0) {
        return;
      }
      if (panOffset.value === undefined) {
        // This may happen if `onGestureStart` is called as a part of the
        // JS thread (instead of the UI thread / worklet). If so, when
        // `onGestureStart` sets panOffset.value, the set will be asynchronous,
        // and so it may not actually occur before `onGestureUpdate` is called.
        //
        // Keeping this value as `undefined` when it is not active protects us
        // from the situation where we may use the previous value for panOffset
        // instead; this would cause a visual flicker in the carousel.

        // console.warn("onGestureUpdate: panOffset is undefined");
        return;
      }

      if (validStart.value) {
        validStart.value = false;
        cancelAnimation(translation);
      }
      touching.value = true;
      const { translationX, translationY } = e;

      const physicalPanTranslation = isHorizontal.value ? translationX : translationY;
      const panTranslation = toLogicalGestureValue(physicalPanTranslation, directionSign);
      if (!hasStartedMovement.value && panTranslation !== 0) {
        hasStartedMovement.value = true;
        if (onScrollStart) scheduleOnRN(onScrollStart);
      }

      translation.value = computeGestureTranslation({
        loop,
        overscrollEnabled: overscrollEnabled ?? true,
        currentTranslation: translation.value,
        panOffset: panOffset.value,
        panTranslation,
        max: max.value,
      });
    },
    [
      isHorizontal,
      max,
      panOffset,
      loop,
      overscrollEnabled,
      hasStartedMovement,
      onScrollStart,
      translation,
      validStart,
      touching,
      sizeReady,
      resolvedSize,
      directionSign,
    ]
  );

  const onGestureEnd = useCallback(
    (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>, _success: boolean) => {
      "worklet";
      // Use resolvedSize.value (SharedValue) instead of size (React state)
      // to avoid race condition where sizeReady is true but size is still 0
      const currentSize = resolvedSize.value ?? 0;
      if (!sizeReady.value || currentSize <= 0) {
        panOffset.value = undefined;
        return;
      }

      if (panOffset.value === undefined) {
        // console.warn("onGestureEnd: panOffset is undefined");
        return;
      }

      if (!hasStartedMovement.value) {
        touching.value = false;
        panOffset.value = undefined;
        return;
      }

      const { velocityX, velocityY, translationX, translationY } = e;
      const physicalVelocity = isHorizontal.value ? velocityX : velocityY;
      const scrollEndVelocityValue = toLogicalGestureValue(physicalVelocity, directionSign);
      scrollEndVelocity.value = scrollEndVelocityValue; // may update async: see https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue#remarks

      const physicalPanTranslation = isHorizontal.value ? translationX : translationY;
      const panTranslation = toLogicalGestureValue(physicalPanTranslation, directionSign);

      scrollEndTranslation.value = panTranslation; // may update async: see https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue#remarks

      endWithSpring(panTranslation, scrollEndVelocityValue, onScrollEnd);

      if (!loop) touching.value = false;

      panOffset.value = undefined;
    },
    [
      loop,
      touching,
      panOffset,
      translation,
      isHorizontal,
      scrollEndVelocity,
      scrollEndTranslation,
      endWithSpring,
      onScrollEnd,
      hasStartedMovement,
      sizeReady,
      resolvedSize,
      directionSign,
    ]
  );

  const gesture = usePanGestureProxy({
    onConfigurePanGesture,
    onGestureStart,
    onGestureUpdate,
    onGestureEnd,
    options: { enabled: scrollEnabled },
  });

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      "worklet";

      const measuredWidth = e.nativeEvent.layout.width;
      const measuredHeight = e.nativeEvent.layout.height;
      const measuredSize = Math.round((isVertical ? measuredHeight : measuredWidth) || 0);

      if (!sizeExplicit && measuredSize > 0) {
        const current = resolvedSize.value ?? 0;
        if (Math.abs(current - measuredSize) > 0) {
          sizePhase.value = current > 0 ? "updating" : sizePhase.value;
          resolvedSize.value = measuredSize;
          sizePhase.value = "ready";
        }
      }

      updateContainerSize({
        width: measuredWidth,
        height: measuredHeight,
      });
    },
    [updateContainerSize, resolvedSize, sizePhase, isVertical, sizeExplicit]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        testID={testID}
        style={style}
        onTouchStart={onTouchBegin}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onLayout={onLayout}
      >
        {props.children}
      </Animated.View>
    </GestureDetector>
  );
};

export const ScrollViewGesture = IScrollViewGesture;
