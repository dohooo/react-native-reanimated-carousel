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
  loop?: boolean
}): IVisibleRanges {
  const {
    total = 0,
    viewSize,
    translation,
    windowSize: _windowSize,
    loop,
  } = options;

  const windowSize = _windowSize ?? total;

  const ranges = useDerivedValue(() => {
    const positiveCount = Math.round(windowSize / 2);
    const negativeCount = windowSize - positiveCount;

    let currentIndex = Math.round(-translation.value / viewSize);
    currentIndex = currentIndex < 0 ? (currentIndex % total) + total : currentIndex;

    if (!loop) {
      // Adjusting negative range if the carousel is not loopable.
      // So, It will be only displayed the positive items.
      return {
        negativeRange: [0 + currentIndex - (windowSize - 1), 0 + currentIndex],
        positiveRange: [0 + currentIndex, currentIndex + (windowSize - 1)],
      };
    }

    const negativeRange = [
      (currentIndex - negativeCount + total) % total,
      (currentIndex - 1 + total) % total,
    ];

    const positiveRange = [
      (currentIndex + total) % total,
      (currentIndex + positiveCount + total) % total,
    ];

    if (negativeRange[0] < total && negativeRange[0] > negativeRange[1]) {
      negativeRange[1] = total - 1;
      positiveRange[0] = 0;
    }
    if (positiveRange[0] > positiveRange[1]) {
      negativeRange[1] = total - 1;
      positiveRange[0] = 0;
    }
    // console.log({ negativeRange, positiveRange ,total,windowSize,a:total <= _windowSize})
    return { negativeRange, positiveRange };
  }, [loop, total, windowSize, translation]);

  return ranges;
}
