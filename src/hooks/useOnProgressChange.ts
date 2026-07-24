import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { CarouselProgressChangeHandler } from "../types";
import { getLogicalProgress } from "../utils/carousel-math";

export function useOnProgressChange(options: {
  loop: boolean;
  offset: SharedValue<number>;
  onProgressChange?: CarouselProgressChangeHandler;
  progress?: SharedValue<number>;
  rawDataLength: number;
  size: number;
  sizeReady: SharedValue<boolean>;
}) {
  const { loop, offset, onProgressChange, progress, rawDataLength, size, sizeReady } = options;

  useAnimatedReaction(
    () => {
      if (!sizeReady.value || size <= 0 || rawDataLength <= 0) return null;

      const logicalProgress = getLogicalProgress(offset.value, size);
      return loop ? logicalProgress : Math.max(0, Math.min(rawDataLength - 1, logicalProgress));
    },
    (nextProgress) => {
      if (nextProgress == null) return;
      if (progress) progress.value = nextProgress;
      if (onProgressChange) scheduleOnRN(onProgressChange, nextProgress);
    },
    [loop, offset, onProgressChange, progress, rawDataLength, size, sizeReady]
  );
}
