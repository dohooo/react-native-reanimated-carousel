import type { PropsWithChildren } from "react";
import React, { useCallback } from "react";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import type {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

import { Easing } from "../constants";
import { usePanGestureProxy } from "../hooks/usePanGestureProxy";
import { useGlobalState } from "../store";
import type { WithTimingAnimation } from "../types";
import { dealWithAnimation } from "../utils/deal-with-animation";

interface Props {
  size: number;
  infinite?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  translation: Animated.SharedValue<number>;
  onLayout?: (e: LayoutChangeEvent) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onTouchBegin?: () => void;
  onTouchEnd?: () => void;
}

const IScrollViewGesture: React.FC<PropsWithChildren<Props>> = (props) => {
  const {
    props: {
      onConfigurePanGesture,
      vertical,
      pagingEnabled,
      snapEnabled,
      loop,
      scrollAnimationDuration,
      withAnimation,
      enabled,
      dataLength,
      overscrollEnabled,
      maxScrollDistancePerSwipe,
      minScrollDistancePerSwipe,
      fixedDirection,
    },
    common: { size },
    layout: { updateContainerSize },
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

  const maxPage = dataLength;
  const isHorizontal = useDerivedValue(() => !vertical, [vertical]);
  const max = useSharedValue(0);
  const panOffset = useSharedValue<number | undefined>(undefined); // set to undefined when not actively in a pan gesture
  const touching = useSharedValue(false);
  const validStart = useSharedValue(false);
  const scrollEndTranslation = useSharedValue(0);
  const scrollEndVelocity = useSharedValue(0);
  const containerRef = useAnimatedRef<Animated.View>();
  const maxScrollDistancePerSwipeIsSet = typeof maxScrollDistancePerSwipe === "number";
  const minScrollDistancePerSwipeIsSet = typeof minScrollDistancePerSwipe === "number";

  // Get the limit of the scroll.
  const getLimit = React.useCallback(() => {
    "worklet";

    if (!loop && !overscrollEnabled) {
      const measurement = measure(containerRef);
      const containerWidth = measurement?.width || 0;

      // If the item's total width is less than the container's width, then there is no need to scroll.
      if (dataLength * size < containerWidth) return 0;

      // Disable the "overscroll" effect
      return dataLength * size - containerWidth;
    }

    return dataLength * size;
  }, [loop, size, dataLength, overscrollEnabled]);

  const withSpring = React.useCallback(
    (toValue: number, onFinished?: () => void) => {
      "worklet";
      const defaultWithAnimation: WithTimingAnimation = {
        type: "timing",
        config: {
          duration: scrollAnimationDuration + 100,
          easing: Easing.easeOutQuart,
        },
      };

      return dealWithAnimation(withAnimation ?? defaultWithAnimation)(
        toValue,
        (isFinished: boolean) => {
          "worklet";
          if (isFinished) onFinished && runOnJS(onFinished)();
        }
      );
    },
    [scrollAnimationDuration, withAnimation]
  );

  const endWithSpring = React.useCallback(
    (
      scrollEndTranslationValue: number,
      scrollEndVelocityValue: number,
      onFinished?: () => void
    ) => {
      "worklet";
      const origin = translation.value;
      const velocity = scrollEndVelocityValue;
      // Default to scroll in the direction of the slide (with deceleration)
      let finalTranslation: number = withDecay({ velocity, deceleration: 0.999 });

      // If the distance of the swipe exceeds the max scroll distance, keep the view at the current position
      if (
        maxScrollDistancePerSwipeIsSet &&
        Math.abs(scrollEndTranslationValue) > maxScrollDistancePerSwipe
      ) {
        finalTranslation = origin;
      } else {
        /**
         * The page size is the same as the item size.
         * If direction is vertical, the page size is the height of the item.
         * If direction is horizontal, the page size is the width of the item.
         *
         * `page size` equals to `size` variable.
         * */

        // calculate target "nextPage" based on the final pan position and the velocity of
        // the pan gesture at termination; this allows for a quick "flick" to indicate a far
        // off page change.
        const nextPage = -Math.round((origin + velocity * 2) / size);

        if (pagingEnabled) {
          // we'll never go further than a single page away from the current page when paging
          // is enabled.

          // distance with direction
          const offset = -(scrollEndTranslationValue >= 0 ? 1 : -1); // 1 or -1
          const computed = offset < 0 ? Math.ceil : Math.floor;
          const page = computed(-origin / size);

          const velocityDirection = -Math.sign(velocity);
          if (page === nextPage || velocityDirection !== offset) {
            // not going anywhere! Velocity was insufficient to overcome the distance to get to a
            // further page. Let's reset gently to the current page.
            finalTranslation = withSpring(withProcessTranslation(-page * size), onFinished);
          } else if (loop) {
            const finalPage = page + offset;
            finalTranslation = withSpring(withProcessTranslation(-finalPage * size), onFinished);
          } else {
            const finalPage = Math.min(maxPage - 1, Math.max(0, page + offset));
            finalTranslation = withSpring(withProcessTranslation(-finalPage * size), onFinished);
          }
        }

        if (!pagingEnabled && snapEnabled) {
          // scroll to the nearest item
          finalTranslation = withSpring(withProcessTranslation(-nextPage * size), onFinished);
        }
      }

      translation.value = finalTranslation;

      function withProcessTranslation(translation: number) {
        if (!loop && !overscrollEnabled) {
          const limit = getLimit();
          const sign = Math.sign(translation);
          return sign * Math.max(0, Math.min(limit, Math.abs(translation)));
        }

        return translation;
      }
    },
    [
      withSpring,
      size,
      maxPage,
      loop,
      snapEnabled,
      translation,
      pagingEnabled,
      maxScrollDistancePerSwipe,
      maxScrollDistancePerSwipeIsSet,
    ]
  );

  const onFinish = React.useCallback(
    (isFinished: boolean) => {
      "worklet";
      if (isFinished) {
        touching.value = false;
        onScrollEnd && runOnJS(onScrollEnd)();
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

    if (translation.value < -((maxPage - 1) * size)) {
      if (scrollEndTranslation.value > 0) {
        activeDecay();
        return;
      }
      if (!loop) translation.value = withSpring(-((maxPage - 1) * size));
    }
  }, [touching, translation, maxPage, size, scrollEndTranslation, loop, activeDecay, withSpring]);

  useAnimatedReaction(
    () => translation.value,
    () => {
      if (!pagingEnabled) resetBoundary();
    },
    [pagingEnabled, resetBoundary]
  );

  function withProcessTranslation(translation: number) {
    "worklet";

    if (!loop && !overscrollEnabled) {
      const limit = getLimit();
      const sign = Math.sign(translation);
      return sign * Math.max(0, Math.min(limit, Math.abs(translation)));
    }

    return translation;
  }

  const onGestureStart = useCallback(
    (_: PanGestureHandlerEventPayload) => {
      "worklet";

      touching.value = true;
      validStart.value = true;
      onScrollStart && runOnJS(onScrollStart)();

      max.value = (maxPage - 1) * size;
      if (!loop && !overscrollEnabled) max.value = getLimit();

      panOffset.value = translation.value;
    },
    [
      max,
      size,
      maxPage,
      loop,
      touching,
      panOffset,
      validStart,
      translation,
      overscrollEnabled,
      getLimit,
      onScrollStart,
    ]
  );

  const onGestureUpdate = useCallback(
    (e: PanGestureHandlerEventPayload) => {
      "worklet";

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

      let panTranslation = isHorizontal.value ? translationX : translationY;

      if (fixedDirection === "negative") panTranslation = -Math.abs(panTranslation);
      else if (fixedDirection === "positive") panTranslation = +Math.abs(panTranslation);

      if (!loop) {
        if (translation.value > 0 || translation.value < -max.value) {
          const boundary = translation.value > 0 ? 0 : -max.value;
          const fixed = boundary - panOffset.value;
          const dynamic = panTranslation - fixed;
          translation.value = boundary + dynamic * 0.5;
          return;
        }
      }

      const translationValue = panOffset.value + panTranslation;
      translation.value = translationValue;
    },
    [
      isHorizontal,
      max,
      panOffset,
      loop,
      overscrollEnabled,
      fixedDirection,
      translation,
      validStart,
      touching,
    ]
  );

  const onGestureEnd = useCallback(
    (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>, _success: boolean) => {
      "worklet";

      if (panOffset.value === undefined) {
        // console.warn("onGestureEnd: panOffset is undefined");
        return;
      }

      const { velocityX, velocityY, translationX, translationY } = e;
      const scrollEndVelocityValue = isHorizontal.value ? velocityX : velocityY;
      scrollEndVelocity.value = scrollEndVelocityValue; // may update async: see https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue#remarks

      let panTranslation = isHorizontal.value ? translationX : translationY;

      if (fixedDirection === "negative") panTranslation = -Math.abs(panTranslation);
      else if (fixedDirection === "positive") panTranslation = +Math.abs(panTranslation);

      scrollEndTranslation.value = panTranslation; // may update async: see https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue#remarks

      const totalTranslation = scrollEndVelocityValue + panTranslation;

      /**
       * If the maximum scroll distance is set and the translation `exceeds the maximum scroll distance`,
       * the carousel will keep the view at the current position.
       */
      if (
        maxScrollDistancePerSwipeIsSet &&
        Math.abs(totalTranslation) > maxScrollDistancePerSwipe
      ) {
        const nextPage =
          Math.round(
            (panOffset.value + maxScrollDistancePerSwipe * Math.sign(totalTranslation)) / size
          ) * size;
        translation.value = withSpring(withProcessTranslation(nextPage), onScrollEnd);
      } else if (
        /**
         * If the minimum scroll distance is set and the translation `didn't exceeds the minimum scroll distance`,
         * the carousel will keep the view at the current position.
         */
        minScrollDistancePerSwipeIsSet &&
        Math.abs(totalTranslation) < minScrollDistancePerSwipe
      ) {
        const nextPage =
          Math.round(
            (panOffset.value + minScrollDistancePerSwipe * Math.sign(totalTranslation)) / size
          ) * size;
        translation.value = withSpring(withProcessTranslation(nextPage), onScrollEnd);
      } else {
        endWithSpring(panTranslation, scrollEndVelocityValue, onScrollEnd);
      }

      if (!loop) touching.value = false;

      panOffset.value = undefined;
    },
    [
      size,
      loop,
      touching,
      panOffset,
      translation,
      isHorizontal,
      scrollEndVelocity,
      scrollEndTranslation,
      fixedDirection,
      maxScrollDistancePerSwipeIsSet,
      maxScrollDistancePerSwipe,
      maxScrollDistancePerSwipeIsSet,
      minScrollDistancePerSwipe,
      endWithSpring,
      withSpring,
      onScrollEnd,
    ]
  );

  const gesture = usePanGestureProxy({
    onConfigurePanGesture,
    onGestureStart,
    onGestureUpdate,
    onGestureEnd,
    options: { enabled },
  });

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      "worklet";
      updateContainerSize({
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height,
      });
    },
    [updateContainerSize]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        ref={containerRef}
        testID={testID}
        style={style}
        onTouchStart={onTouchBegin}
        onTouchEnd={onTouchEnd}
        onLayout={onLayout}
      >
        {props.children}
      </Animated.View>
    </GestureDetector>
  );
};

export const ScrollViewGesture = IScrollViewGesture;
