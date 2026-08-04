import { Platform } from "react-native";

import type { CarouselPanGesture } from "../src/public-types";

/**
 * issue #942: v4.x supported configuring RNGH's web-only `touchAction`
 * (e.g. "pan-y" so a horizontal carousel nested in a vertically scrollable
 * page keeps native vertical scrolling on mobile web) through
 * `onConfigurePanGesture`. The behavior still works at runtime in v5, but
 * the `CarouselPanGesture` facade no longer exposes a typed path for it,
 * forcing consumers to cast to `any` / `PanGesture`.
 *
 * This file states the expected public API: it must type-check once the
 * facade regains an officially supported way to set `touchAction`.
 */
export function configurePanGesture(gesture: CarouselPanGesture) {
  "worklet";

  if (Platform.OS === "web") {
    gesture.config.touchAction = "pan-y";
  }
}
