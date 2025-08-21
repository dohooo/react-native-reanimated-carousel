import type { SharedValue } from "react-native-reanimated";

import type { TCarouselProps } from "../types";

export function handlerOffsetDirection(
  handlerOffset: SharedValue<number>,
  fixedDirection?: TCarouselProps["fixedDirection"],
  loop?: boolean
): -1 | 1 {
  "worklet";

  if (fixedDirection === "negative") return -1;

  if (fixedDirection === "positive") return 1;

  if (handlerOffset.value === 0) return -1;

  // Handle overscroll case when loop is disabled
  // When loop=false and small positive offset occurs (overscroll at index 0),
  // return -1 to maintain consistent direction handling
  if (loop === false) return -1;

  return Math.sign(handlerOffset.value) as -1 | 1;
}
