import type Animated from "react-native-reanimated";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";

import type { TCarouselProps } from "../types";
import { computedOffsetXValueWithAutoFillData } from "../utils/computed-with-auto-fill-data";

export function useOnProgressChange(
  opts: {
    size: number;
    autoFillData: boolean;
    loop: boolean;
    offsetX: Animated.SharedValue<number>;
    rawDataLength: number;
  } & Pick<TCarouselProps, "onProgressChange">
) {
  const { autoFillData, loop, offsetX, size, rawDataLength, onProgressChange } = opts;

  // remember `isFunc` here because we can't accurately check typeof
  // from within useAnimatedReaction because its code has been workletized;
  // the `onProgressChange` value will be typeof "object" from within
  // the worklet code even if it's a function.
  const isFunc = typeof onProgressChange === "function";

  useAnimatedReaction(
    () => offsetX.value,
    (_value) => {
      let value = computedOffsetXValueWithAutoFillData({
        value: _value,
        rawDataLength,
        size,
        autoFillData,
        loop,
      });

      if (!loop) {
        value = Math.max(-((rawDataLength - 1) * size), Math.min(value, 0));
      }

      let absoluteProgress = Math.abs(value / size);

      if (value > 0) absoluteProgress = rawDataLength - absoluteProgress;

      if (onProgressChange) {
        if (isFunc) runOnJS(onProgressChange)(value, absoluteProgress);
        else onProgressChange.value = absoluteProgress;
      }
    },
    [loop, autoFillData, rawDataLength, onProgressChange, size]
  );
}
