import { useEffect } from "react";
import type { PanGesture } from "react-native-gesture-handler";

export const useUpdateGestureConfig = (gesture: PanGesture, config: {
  enabled?: boolean
}) => {
  const { enabled } = config;

  useEffect(() => {
    if (typeof enabled !== "undefined")
      gesture.enabled(enabled);
  }, [enabled, gesture]);
};
