import { useRef } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

type Range = [number, number];

export interface VisibleRanges {
  negativeRange: Range;
  positiveRange: Range;
}

export type IVisibleRanges = SharedValue<VisibleRanges>;

function normalizeWindowSize(total: number, windowSize?: number) {
  "worklet";

  return typeof windowSize === "number" && Number.isFinite(windowSize) && windowSize > 0
    ? windowSize
    : total;
}

function normalizeLoopIndex(currentIndex: number, total: number) {
  "worklet";

  return currentIndex < 0 ? (currentIndex % total) + total : currentIndex;
}

export function computeVisibleRanges(params: {
  total: number;
  windowSize?: number;
  currentIndex: number;
  loop?: boolean;
}): VisibleRanges {
  "worklet";

  const { total = 0, loop } = params;
  const windowSize = normalizeWindowSize(total, params.windowSize);

  if (total <= 0) {
    return {
      negativeRange: [0, 0],
      positiveRange: [0, -1],
    };
  }

  if (loop && windowSize >= total) {
    return {
      negativeRange: [0, 0],
      positiveRange: [0, total - 1],
    };
  }

  const positiveCount = Math.round(windowSize / 2);
  const negativeCount = windowSize - positiveCount;

  let currentIndex = params.currentIndex;
  if (!Number.isFinite(currentIndex)) currentIndex = 0;

  if (!loop) {
    currentIndex = Math.max(0, Math.min(total - 1, currentIndex));
    return {
      negativeRange: [Math.max(0, currentIndex - (windowSize - 1)), currentIndex],
      positiveRange: [currentIndex, Math.min(total - 1, currentIndex + (windowSize - 1))],
    };
  }

  currentIndex = normalizeLoopIndex(currentIndex, total);

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

  return { negativeRange, positiveRange };
}

export function useVisibleRanges(options: {
  total: number;
  viewSize: number;
  windowSize?: number;
  translation: SharedValue<number>;
  loop?: boolean;
}): IVisibleRanges {
  const { total = 0, viewSize, translation, windowSize: _windowSize, loop } = options;

  const windowSize = normalizeWindowSize(total, _windowSize);
  const cachedRanges = useRef<VisibleRanges | null>(null);

  const ranges = useDerivedValue(() => {
    if (total <= 0) {
      return computeVisibleRanges({ total, currentIndex: 0, windowSize, loop });
    }

    // Prevent division by zero when viewSize is not yet measured
    if (!Number.isFinite(viewSize) || viewSize <= 0) {
      return {
        negativeRange: [0, 0] as Range,
        positiveRange: [0, Math.min(total - 1, windowSize - 1)] as Range,
      };
    }

    let currentIndex = Math.round(-translation.value / viewSize);
    if (!Number.isFinite(currentIndex)) currentIndex = 0;

    const newRanges = computeVisibleRanges({ total, windowSize, currentIndex, loop });

    if (
      cachedRanges.current &&
      isArraysEqual(cachedRanges.current.negativeRange, newRanges.negativeRange) &&
      isArraysEqual(cachedRanges.current.positiveRange, newRanges.positiveRange)
    ) {
      return cachedRanges.current;
    }

    cachedRanges.current = newRanges;
    return newRanges;
  }, [loop, total, windowSize, translation, viewSize]);

  return ranges;
}

function isArraysEqual(a: number[], b: number[]): boolean {
  "worklet";
  if (a.length !== b.length) return false;

  return a.every((value, index) => value === b[index]);
}
