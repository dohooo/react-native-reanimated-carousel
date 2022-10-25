import type Animated from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

export type IVisibleRanges = Animated.SharedValue<{
  negativeRange: number[]
  positiveRange: number[]
}>;

export function useVisibleRanges(options: {
  total: number
  viewSize: number
  windowSize?: number
  translation: Animated.SharedValue<number>
}): IVisibleRanges {
  const {
    total = 0,
    viewSize,
    translation,
    windowSize: _windowSize = 0,
  } = options;

  const windowSize = total <= _windowSize ? total : _windowSize;

  const ranges = useDerivedValue(() => {
    const positiveCount = Math.round(windowSize / 2);
    const negativeCount = windowSize - positiveCount;
    let curIndex = Math.round(-translation.value / viewSize);
    curIndex = curIndex < 0 ? (curIndex % total) + total : curIndex;
    const negativeRange = [
      (curIndex - negativeCount + total) % total,
      (curIndex - 1 + total) % total,
    ];
    const positiveRange = [
      (curIndex + total) % total,
      (curIndex + positiveCount + total) % total,
    ];
    if (negativeRange[0] < total && negativeRange[0] > negativeRange[1]) {
      negativeRange[1] = total - 1;
      positiveRange[0] = 0;
    }
    if (positiveRange[0] > positiveRange[1]) {
      negativeRange[1] = total - 1;
      positiveRange[0] = 0;
    }
    return { negativeRange, positiveRange };
  }, [total, windowSize, translation]);

  return ranges;
}
