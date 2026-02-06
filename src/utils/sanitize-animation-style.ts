import type { ViewStyle } from "react-native";

type MutableViewStyle = ViewStyle & { zIndex?: unknown };

export function sanitizeAnimationStyle(style: ViewStyle): ViewStyle {
  "worklet";

  if (!style || typeof style !== "object") return {};

  const nextStyle: MutableViewStyle = { ...style };
  const { zIndex, ...restStyle } = nextStyle;

  if (typeof zIndex === "number") {
    // Native layers are sensitive to invalid/non-integer zIndex values.
    if (Number.isFinite(zIndex)) return { ...restStyle, zIndex: Math.round(zIndex) };
    return restStyle;
  }

  return typeof zIndex === "undefined" ? nextStyle : restStyle;
}
