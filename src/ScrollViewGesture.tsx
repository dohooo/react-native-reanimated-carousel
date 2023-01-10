import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  measure,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

import { Easing } from "./constants";
import { CTX } from "./store";
import type { WithTimingAnimation } from "./types";
import { dealWithAnimation } from "./utils/dealWithAnimation";

interface GestureContext extends Record<string, unknown> {
  validStart: boolean
  panOffset: number
  max: number
}

interface Props {
  size: number
  infinite?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
  onScrollBegin?: () => void
  onScrollEnd?: () => void
  onTouchBegin?: () => void
  onTouchEnd?: () => void
  translation: Animated.SharedValue<number>
}

const IScrollViewGesture: React.FC<Props> = (props) => {
  const {
    props: {
      vertical,
      pagingEnabled,
      snapEnabled,
      panGestureHandlerProps,
      loop: infinite,
      scrollAnimationDuration,
      withAnimation,
      enabled,
      dataLength,
      overscrollEnabled,
    },
  } = React.useContext(CTX);

  const {
    size,
    translation,
    testID,
    style = {},
    onScrollBegin,
    onScrollEnd,
    onTouchBegin,
    onTouchEnd,
  } = props;

  const maxPage = dataLength;
  const isHorizontal = useDerivedValue(() => !vertical, [vertical]);
  const touching = useSharedValue(false);
  const scrollEndTranslation = useSharedValue(0);
  const scrollEndVelocity = useSharedValue(0);
  const containerRef = useAnimatedRef<Animated.View>();

  // Get the limit of the scroll.
  const getLimit = React.useCallback(() => {
    "worklet";

    if (!infinite && !overscrollEnabled) {
      const { width: containerWidth = 0 } = measure(containerRef);

      // If the item's total width is less than the container's width, then there is no need to scroll.
      if (dataLength * size < containerWidth)
        return 0;

      // Disable the "overscroll" effect
      return dataLength * size - containerWidth;
    }

    return dataLength * size;
  }, [infinite, size, dataLength, overscrollEnabled]);

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
          if (isFinished)
            onFinished && runOnJS(onFinished)();
        },
      );
    },
    [scrollAnimationDuration, withAnimation],
  );

  const endWithSpring = React.useCallback(
    (onFinished?: () => void) => {
      "worklet";
      const origin = translation.value;
      const velocity = scrollEndVelocity.value;
      // Default to scroll in the direction of the slide (with deceleration)
      let finalTranslation: number = withDecay({ velocity, deceleration: 0.999 });

      /**
       * The page size is the same as the item size.
       * If direction is vertical, the page size is the height of the item.
       * If direction is horizontal, the page size is the width of the item.
       *
       * `page size` equals to `size` variable.
       * */
      if (pagingEnabled) {
        // distance with direction
        const offset = -(scrollEndTranslation.value >= 0 ? 1 : -1); // 1 or -1
        const computed = offset < 0 ? Math.ceil : Math.floor;
        const page = computed(-translation.value / size);

        if (infinite) {
          const finalPage = page + offset;
          finalTranslation = withSpring(withProcessTranslation(-finalPage * size), onFinished);
        }
        else {
          const finalPage = Math.min(maxPage - 1, Math.max(0, page + offset));
          finalTranslation = withSpring(withProcessTranslation(-finalPage * size), onFinished);
        }
      }

      if (!pagingEnabled && snapEnabled) {
        // scroll to the nearest item
        const nextPage = Math.round((origin + velocity * 0.4) / size) * size;
        finalTranslation = withSpring(withProcessTranslation(nextPage), onFinished);
      }

      translation.value = finalTranslation;

      function withProcessTranslation(translation: number) {
        if (!infinite && !overscrollEnabled) {
          const limit = getLimit();
          const sign = Math.sign(translation);
          return sign * Math.max(0, Math.min(limit, Math.abs(translation)));
        }

        return translation;
      }
    },
    [
      translation,
      scrollEndVelocity.value,
      pagingEnabled,
      size,
      scrollEndTranslation.value,
      infinite,
      withSpring,
      snapEnabled,
      maxPage,
    ],
  );

  const onFinish = React.useCallback(
    (isFinished: boolean) => {
      "worklet";
      if (isFinished) {
        touching.value = false;
        onScrollEnd && runOnJS(onScrollEnd)();
      }
    },
    [onScrollEnd, touching],
  );

  const activeDecay = React.useCallback(() => {
    "worklet";
    touching.value = true;
    translation.value = withDecay(
      { velocity: scrollEndVelocity.value },
      isFinished => onFinish(isFinished as boolean),
    );
  }, [onFinish, scrollEndVelocity.value, touching, translation]);

  const resetBoundary = React.useCallback(() => {
    "worklet";
    if (touching.value)
      return;

    if (translation.value > 0) {
      if (scrollEndTranslation.value < 0) {
        activeDecay();
        return;
      }
      if (!infinite) {
        translation.value = withSpring(0);
        return;
      }
    }

    if (translation.value < -((maxPage - 1) * size)) {
      if (scrollEndTranslation.value > 0) {
        activeDecay();
        return;
      }
      if (!infinite)
        translation.value = withSpring(-((maxPage - 1) * size));
    }
  }, [
    touching.value,
    translation,
    maxPage,
    size,
    scrollEndTranslation.value,
    infinite,
    activeDecay,
    withSpring,
  ]);

  useAnimatedReaction(
    () => translation.value,
    () => {
      if (!pagingEnabled)
        resetBoundary();
    },
    [pagingEnabled, resetBoundary],
  );

  const panGestureEventHandler = useAnimatedGestureHandler<
  PanGestureHandlerGestureEvent,
  GestureContext
  >(
    {
      onStart: (_, ctx) => {
        touching.value = true;
        ctx.validStart = true;
        onScrollBegin && runOnJS(onScrollBegin)();

        ctx.max = (maxPage - 1) * size;
        if (!infinite && !overscrollEnabled)
          ctx.max = getLimit();

        ctx.panOffset = translation.value;
      },
      onActive: (e, ctx) => {
        if (ctx.validStart) {
          ctx.validStart = false;
          cancelAnimation(translation);
        }
        touching.value = true;
        const { translationX, translationY } = e;
        const panTranslation = isHorizontal.value
          ? translationX
          : translationY;
        if (!infinite) {
          if ((translation.value > 0 || translation.value < -ctx.max)) {
            const boundary = translation.value > 0 ? 0 : -ctx.max;
            const fixed = boundary - ctx.panOffset;
            const dynamic = panTranslation - fixed;
            translation.value = boundary + dynamic * 0.5;
            return;
          }
        }

        const translationValue = ctx.panOffset + panTranslation;
        translation.value = translationValue;
      },
      onEnd: (e) => {
        const { velocityX, velocityY, translationX, translationY } = e;
        scrollEndVelocity.value = isHorizontal.value
          ? velocityX
          : velocityY;
        scrollEndTranslation.value = isHorizontal.value
          ? translationX
          : translationY;

        endWithSpring(onScrollEnd);

        if (!infinite)
          touching.value = false;
      },
    },
    [
      pagingEnabled,
      isHorizontal.value,
      infinite,
      maxPage,
      size,
      snapEnabled,
      onScrollBegin,
      onScrollEnd,
    ],
  );

  return (
    <PanGestureHandler
      {...panGestureHandlerProps}
      enabled={enabled}
      onGestureEvent={panGestureEventHandler}
    >
      <Animated.View
        ref={containerRef}
        testID={testID}
        style={style}
        onTouchStart={onTouchBegin}
        onTouchEnd={onTouchEnd}
      >
        {props.children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export const ScrollViewGesture = IScrollViewGesture;
