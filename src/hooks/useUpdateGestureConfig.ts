import { useEffect } from "react";
import type { PanGesture } from "react-native-gesture-handler";

export interface GestureConfig {
  enabled?: boolean;
}

export const useUpdateGestureConfig = (gesture: PanGesture, config: GestureConfig) => {
  const { enabled } = config;

  useEffect(() => {
    if (typeof enabled !== "undefined") gesture.enabled(enabled);
  }, [enabled, gesture]);
};
