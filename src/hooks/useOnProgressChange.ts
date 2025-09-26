import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { TCarouselProps } from "../types";
import { computedOffsetXValueWithAutoFillData } from "../utils/computed-with-auto-fill-data";

export function useOnProgressChange(
  opts: {
    size: number;
    sizeReady: SharedValue<boolean>;
    autoFillData: boolean;
    loop: boolean;
    offsetX: SharedValue<number>;
    rawDataLength: number;
  } & Pick<TCarouselProps, "onProgressChange">
) {
  const { autoFillData, loop, offsetX, size, rawDataLength, onProgressChange, sizeReady } = opts;

  // remember `isFunc` here because we can't accurately check typeof
  // from within useAnimatedReaction because its code has been workletized;
  // the `onProgressChange` value will be typeof "object" from within
  // the worklet code even if it's a function.
  const isFunc = typeof onProgressChange === "function";

  useAnimatedReaction(
    () => ({ offset: offsetX.value, ready: sizeReady.value }),
    ({ offset, ready }) => {
      const safeSize = size > 0 ? size : 0;
      if (!ready || safeSize <= 0) return;

      let value = computedOffsetXValueWithAutoFillData({
        value: offset,
        rawDataLength,
        size: safeSize,
        autoFillData,
        loop,
      });

      if (!loop) {
        value = Math.max(-((rawDataLength - 1) * safeSize), Math.min(value, 0));
      }

      let absoluteProgress = Math.abs(value / safeSize);

      if (value > 0) absoluteProgress = rawDataLength - absoluteProgress;

      if (onProgressChange) {
        if (isFunc) {
          scheduleOnRN(onProgressChange, value, absoluteProgress);
        } else {
          (onProgressChange as SharedValue<number>).value = absoluteProgress;
        }
      }
    },
    [loop, autoFillData, rawDataLength, onProgressChange, size]
  );
}
