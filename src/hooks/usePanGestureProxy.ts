import { useMemo } from "react";
import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGesture,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { Gesture } from "react-native-gesture-handler";

import type { GestureConfig } from "./useUpdateGestureConfig";
import { useUpdateGestureConfig } from "./useUpdateGestureConfig";

export const usePanGestureProxy = (customization: {
  onConfigurePanGesture?: (gesture: PanGesture) => void;
  onGestureStart: (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => void;
  onGestureUpdate: (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void;
  onGestureEnd: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    success: boolean
  ) => void;
  options?: GestureConfig;
}) => {
  const {
    onConfigurePanGesture,
    onGestureStart,
    onGestureUpdate,
    onGestureEnd,
    options = {},
  } = customization;

  const gesture = useMemo(() => {
    const gesture = Gesture.Pan().withTestId("rnrc-gesture-handler");

    // Save the original gesture callbacks
    const originalGestures = {
      onBegin: gesture.onBegin,
      onStart: gesture.onStart,
      onUpdate: gesture.onUpdate,
      onEnd: gesture.onEnd,
      onFinalize: gesture.onFinalize,
    };

    // Save the user defined gesture callbacks
    const userDefinedConflictGestures: {
      onBegin?: Parameters<(typeof gesture)["onBegin"]>[0];
      onStart?: Parameters<(typeof gesture)["onStart"]>[0];
      onUpdate?: Parameters<(typeof gesture)["onUpdate"]>[0];
      onEnd?: Parameters<(typeof gesture)["onEnd"]>[0];
      onFinalize?: Parameters<(typeof gesture)["onFinalize"]>[0];
    } = {
      onBegin: undefined,
      onStart: undefined,
      onUpdate: undefined,
      onEnd: undefined,
      onFinalize: undefined,
    };

    const fakeOnBegin: typeof gesture.onBegin = (cb) => {
      // Using fakeOnBegin to save the user defined callback
      userDefinedConflictGestures.onBegin = cb;
      return gesture;
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

    const fakeOnFinalize: typeof gesture.onFinalize = (cb) => {
      // Using fakeOnFinalize to save the user defined callback
      userDefinedConflictGestures.onFinalize = cb;
      return gesture;
    };

    // Setup the fake callbacks
    gesture.onBegin = fakeOnBegin;
    gesture.onStart = fakeOnStart;
    gesture.onUpdate = fakeOnUpdate;
    gesture.onEnd = fakeOnEnd;
    gesture.onFinalize = fakeOnFinalize;

    if (onConfigurePanGesture)
      // Get the gesture with the user defined configuration
      onConfigurePanGesture(gesture);

    // Restore the original callbacks
    gesture.onBegin = originalGestures.onBegin;
    gesture.onStart = originalGestures.onStart;
    gesture.onUpdate = originalGestures.onUpdate;
    gesture.onEnd = originalGestures.onEnd;
    gesture.onFinalize = originalGestures.onFinalize;

    // Setup the original callbacks with the user defined callbacks
    gesture
      .onBegin((e) => {
        "worklet";

        if (userDefinedConflictGestures.onBegin) userDefinedConflictGestures.onBegin(e);
      })
      .onStart((e) => {
        "worklet";
        onGestureStart(e);

        if (userDefinedConflictGestures.onStart) userDefinedConflictGestures.onStart(e);
      })
      .onUpdate((e) => {
        "worklet";
        onGestureUpdate(e);

        if (userDefinedConflictGestures.onUpdate) userDefinedConflictGestures.onUpdate(e);
      })
      .onEnd((e, success) => {
        "worklet";
        onGestureEnd(e, success);

        if (userDefinedConflictGestures.onEnd) userDefinedConflictGestures.onEnd(e, success);
      })
      .onFinalize((e, success) => {
        "worklet";

        if (userDefinedConflictGestures.onFinalize)
          userDefinedConflictGestures.onFinalize(e, success);
      });

    return gesture;
  }, [onGestureStart, onGestureUpdate, onGestureEnd, onConfigurePanGesture]);

  useUpdateGestureConfig(gesture, options);

  return gesture;
};
