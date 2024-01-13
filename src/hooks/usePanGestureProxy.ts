import { useMemo } from "react";
import type { GestureStateChangeEvent, GestureUpdateEvent, PanGesture, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { Gesture } from "react-native-gesture-handler";

import type { GestureConfig } from "./useUpdateGestureConfig";
import { useUpdateGestureConfig } from "./useUpdateGestureConfig";

export const usePanGestureProxy = (
  customization: {
    onConfigurePanGesture?: (gesture: PanGesture) => void
    onGestureStart: (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => void
    onGestureUpdate: (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void
    onGestureEnd: (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>, success: boolean) => void
    options?: GestureConfig
  },
) => {
  const {
    onConfigurePanGesture,
    onGestureStart,
    onGestureUpdate,
    onGestureEnd,
    options = {},
  } = customization;

  const gesture = useMemo(() => {
    const gesture = Gesture.Pan();

    // Save the original gesture callbacks
    const originalGestures = {
      onStart: gesture.onStart,
      onUpdate: gesture.onUpdate,
      onEnd: gesture.onEnd,
    };

    // Save the user defined gesture callbacks
    const userDefinedConflictGestures: {
      onStart?: Parameters<(typeof gesture)["onStart"]>[0]
      onUpdate?: Parameters<(typeof gesture)["onUpdate"]>[0]
      onEnd?: Parameters<(typeof gesture)["onEnd"]>[0]
    } = {
      onStart: undefined,
      onUpdate: undefined,
      onEnd: undefined,
    };

    const fakeOnStart: typeof gesture.onStart = (cb) => {
      // Using fakeOnStart to save the user defined callback
      userDefinedConflictGestures.onStart = cb;
      return gesture;
    };

    const fakeOnUpdate: typeof gesture.onUpdate = (cb) => {
      // Using fakeOnUpdate to save the user defined callback
      userDefinedConflictGestures.onUpdate = cb;
      return gesture;
    };

    const fakeOnEnd: typeof gesture.onEnd = (cb) => {
      // Using fakeOnEnd to save the user defined callback
      userDefinedConflictGestures.onEnd = cb;
      return gesture;
    };

    // Setup the fake callbacks
    gesture.onStart = fakeOnStart;
    gesture.onUpdate = fakeOnUpdate;
    gesture.onEnd = fakeOnEnd;

    if (onConfigurePanGesture)
      // Get the gesture with the user defined configuration
      onConfigurePanGesture(gesture);

    // Restore the original callbacks
    gesture.onStart = originalGestures.onStart;
    gesture.onUpdate = originalGestures.onUpdate;
    gesture.onEnd = originalGestures.onEnd;

    // Setup the original callbacks with the user defined callbacks
    gesture
      .onStart((e) => {
        onGestureStart(e);

        if (userDefinedConflictGestures.onStart)
          userDefinedConflictGestures.onStart(e);
      })
      .onUpdate((e) => {
        onGestureUpdate(e);

        if (userDefinedConflictGestures.onUpdate)
          userDefinedConflictGestures.onUpdate(e);
      })
      .onEnd((e, success) => {
        onGestureEnd(e, success);

        if (userDefinedConflictGestures.onEnd)
          userDefinedConflictGestures.onEnd(e, success);
      });

    return gesture;
  }, [
    onGestureStart,
    onGestureUpdate,
    onGestureEnd,
    onConfigurePanGesture,
  ]);

  useUpdateGestureConfig(gesture, options);

  return gesture;
};
