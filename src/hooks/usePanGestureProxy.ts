import { useMemo } from "react";
import type { GestureStateChangeEvent, GestureUpdateEvent, PanGesture, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { Gesture } from "react-native-gesture-handler";

import type { GestureConfig } from "./useUpdateGestureConfig";
import { useUpdateGestureConfig } from "./useUpdateGestureConfig";

export const usePanGestureProxy = (
  customization: {
    onConfigurePanGesture?: (gesture: PanGesture) => void
    onGestureBegin: (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => void
    onGestureUpdate: (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void
    onGestureEnd: (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>, success: boolean) => void
    options?: GestureConfig
  },
) => {
  const {
    onConfigurePanGesture,
    onGestureBegin,
    onGestureUpdate,
    onGestureEnd,
    options = {},
  } = customization;

  const gesture = useMemo(() => {
    const gesture = Gesture.Pan();

    // Save the original gesture callbacks
    const originalGestures = {
      onBegin: gesture.onBegin,
      onUpdate: gesture.onUpdate,
      onEnd: gesture.onEnd,
    };

    // Save the user defined gesture callbacks
    const userDefinedConflictGestures: {
      onBegin?: Parameters<(typeof gesture)["onBegin"]>[0]
      onUpdate?: Parameters<(typeof gesture)["onUpdate"]>[0]
      onEnd?: Parameters<(typeof gesture)["onEnd"]>[0]
    } = {
      onBegin: undefined,
      onUpdate: undefined,
      onEnd: undefined,
    };

    const fakeOnBegin: typeof gesture.onBegin = (cb) => {
      // Using fakeOnBegin to save the user defined callback
      userDefinedConflictGestures.onBegin = cb;
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
    gesture.onBegin = fakeOnBegin;
    gesture.onUpdate = fakeOnUpdate;
    gesture.onEnd = fakeOnEnd;

    if (onConfigurePanGesture)
      // Get the gesture with the user defined configuration
      onConfigurePanGesture(gesture);

    // Restore the original callbacks
    gesture.onBegin = originalGestures.onBegin;
    gesture.onUpdate = originalGestures.onUpdate;
    gesture.onEnd = originalGestures.onEnd;

    // Setup the original callbacks with the user defined callbacks
    gesture
      .onBegin((e) => {
        onGestureBegin(e);

        if (userDefinedConflictGestures.onBegin)
          userDefinedConflictGestures.onBegin(e);
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
    onGestureBegin,
    onGestureUpdate,
    onGestureEnd,
    onConfigurePanGesture,
  ]);

  useUpdateGestureConfig(gesture, options);

  return gesture;
};
