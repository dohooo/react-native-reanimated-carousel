import { useEffect } from "react";

export interface GestureConfig {
  enabled?: boolean;
}

type ConfigurablePanGesture = {
  enabled(enabled: boolean): unknown;
};

export const useUpdateGestureConfig = (gesture: ConfigurablePanGesture, config: GestureConfig) => {
  const { enabled } = config;

  useEffect(() => {
    if (typeof enabled !== "undefined") gesture.enabled(enabled);
  }, [enabled, gesture]);
};
