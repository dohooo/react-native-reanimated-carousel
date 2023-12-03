import type { SharedValue } from "react-native-reanimated";

export function handlerOffsetDirection(handlerOffset: SharedValue<number>): -1 | 1 {
  "worklet";

  const isPositiveZero = Object.is(handlerOffset.value, +0);
  const isNegativeZero = Object.is(handlerOffset.value, -0);
  const direction = isPositiveZero
    ? 1
    : isNegativeZero
      ? -1
      : Math.sign(handlerOffset.value) as -1 | 1;

  return direction;
}
