import type { SharedValue } from "react-native-reanimated";

import type { TCarouselProps } from "../types";

export function handlerOffsetDirection(
  handlerOffset: SharedValue<number>,
  fixedDirection?: TCarouselProps["fixedDirection"]
): -1 | 1 {
  "worklet";

  if (fixedDirection === "negative") return -1;

  if (fixedDirection === "positive") return 1;

  if (handlerOffset.value === 0) return -1;

  return Math.sign(handlerOffset.value) as -1 | 1;
}
