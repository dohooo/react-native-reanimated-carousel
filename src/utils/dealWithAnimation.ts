import { withSpring, withTiming } from "react-native-reanimated";

import type { WithAnimation } from "../types";

export function dealWithAnimation(
  withAnimation: WithAnimation,
): (value: number, cb: (isFinished: boolean) => void) => number {
  "worklet";
  switch (withAnimation.type) {
    case "spring":
      return (value, cb) => {
        return withSpring(value, withAnimation.config, isFinished =>
          cb(isFinished as boolean),
        );
      };
    case "timing":
      return (value, cb) => {
        return withTiming(value, withAnimation.config, isFinished =>
          cb(isFinished as boolean),
        );
      };
  }
}
