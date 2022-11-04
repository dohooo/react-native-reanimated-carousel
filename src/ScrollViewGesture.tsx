import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
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

  const _withSpring = React.useCallback(
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
      if (!pagingEnabled) {
        /**
                 * If enabled, releasing the touch will scroll to the nearest item.
                 * valid when pagingEnabled=false
                 */
        if (snapEnabled) {
          const nextPage
                        = Math.round((origin + velocity * 0.4) / size) * size;

          translation.value = _withSpring(nextPage, onFinished);
          return;
        }
        translation.value = withDecay({
          velocity,
          deceleration: 0.999,
        });
        return;
      }

      const direction = -(scrollEndTranslation.value >= 0 ? 1 : -1);
      const computed = direction < 0 ? Math.ceil : Math.floor;
      const page = computed(-translation.value / size);
      let finalPage = page + direction;

      if (!infinite)
        finalPage = Math.min(maxPage - 1, Math.max(0, finalPage));

      translation.value = _withSpring(-finalPage * size, onFinished);
    },
    [
      translation,
      scrollEndVelocity.value,
      pagingEnabled,
      size,
      scrollEndTranslation.value,
      infinite,
      _withSpring,
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
        translation.value = _withSpring(0);
        return;
      }
    }

    if (translation.value < -((maxPage - 1) * size)) {
      if (scrollEndTranslation.value > 0) {
        activeDecay();
        return;
      }
      if (!infinite)
        translation.value = _withSpring(-((maxPage - 1) * size));
    }
  }, [
    touching.value,
    translation,
    maxPage,
    size,
    scrollEndTranslation.value,
    infinite,
    activeDecay,
    _withSpring,
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

        if (
          !infinite
                    && (translation.value > 0 || translation.value < -ctx.max)
        ) {
          const boundary = translation.value > 0 ? 0 : -ctx.max;
          const fixed = boundary - ctx.panOffset;
          const dynamic = panTranslation - fixed;
          translation.value = boundary + dynamic * 0.5;
          return;
        }

        translation.value = ctx.panOffset + panTranslation;
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
