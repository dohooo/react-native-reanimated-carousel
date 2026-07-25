import { withSpring, withTiming } from "react-native-reanimated";

import type { CarouselAnimation } from "../types";

export function dealWithAnimation(
  animation: CarouselAnimation
): (value: number, cb: (isFinished: boolean) => void) => number {
  "worklet";
  switch (animation.type) {
    case "spring": {
      const { type: _, ...config } = animation;
      return (value, cb) => withSpring(value, config, (isFinished) => cb(isFinished as boolean));
    }
    case "timing": {
      const { type: _, ...config } = animation;
      return (value, cb) => withTiming(value, config, (isFinished) => cb(isFinished as boolean));
    }
  }
}
