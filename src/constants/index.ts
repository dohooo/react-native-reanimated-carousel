import type { EasingFunction } from "react-native-reanimated";
import { Easing as _Easing } from "react-native-reanimated";

export const DATA_LENGTH = {
  SINGLE_ITEM: 1,
  DOUBLE_ITEM: 2,
} as const;

export const Easing = {
  easeOutQuart: _Easing.bezier(0.25, 1, 0.5, 1) as unknown as EasingFunction,
};
