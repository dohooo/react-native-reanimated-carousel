import { useRef } from "react";
import type Animated from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

type Range = [number, number];

export interface VisibleRanges {
  negativeRange: Range;
  positiveRange: Range;
}

export type IVisibleRanges = Animated.SharedValue<VisibleRanges>;

export function useVisibleRanges(options: {
  total: number;
  viewSize: number;
  windowSize?: number;
  translation: Animated.SharedValue<number>;
  loop?: boolean;
}): IVisibleRanges {
  const { total = 0, viewSize, translation, windowSize: _windowSize, loop } = options;

  const windowSize = _windowSize ?? total;
  const cachedRanges = useRef<VisibleRanges>(null!);

  const ranges = useDerivedValue(() => {
    const positiveCount = Math.round(windowSize / 2);
    const negativeCount = windowSize - positiveCount;

    let currentIndex = Math.round(-translation.value / viewSize);
    currentIndex = currentIndex < 0 ? (currentIndex % total) + total : currentIndex;

    let newRanges: VisibleRanges;

    if (!loop) {
      // Adjusting negative range if the carousel is not loopable.
      // So, It will be only displayed the positive items.
      newRanges = {
        negativeRange: [0 + currentIndex - (windowSize - 1), 0 + currentIndex],
        positiveRange: [0 + currentIndex, currentIndex + (windowSize - 1)],
      };
    } else {
      const negativeRange: Range = [
        (currentIndex - negativeCount + total) % total,
        (currentIndex - 1 + total) % total,
      ];

      const positiveRange: Range = [
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
      newRanges = { negativeRange, positiveRange };
    }

    if (
      isArraysEqual(cachedRanges.current?.negativeRange ?? [], newRanges.negativeRange) &&
      isArraysEqual(cachedRanges.current?.positiveRange ?? [], newRanges.positiveRange)
    )
      return cachedRanges.current;

    cachedRanges.current = newRanges;
    return cachedRanges.current;
  }, [loop, total, windowSize, translation]);

  return ranges;
}

function isArraysEqual(a: number[], b: number[]): boolean {
  "worklet";
  if (a.length !== b.length) return false;

  return a.every((value, index) => value === b[index]);
}
