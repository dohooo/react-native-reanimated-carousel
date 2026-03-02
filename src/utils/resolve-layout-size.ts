import type { ViewStyle } from "react-native";

type AxisSize = ViewStyle["width"];

export function resolveLayoutSize(params: {
  vertical: boolean;
  styleWidth: AxisSize;
  styleHeight: AxisSize;
  resolvedSize: number;
  sizeExplicit?: boolean;
  legacyWidth?: number;
  legacyHeight?: number;
}) {
  const {
    vertical,
    styleWidth,
    styleHeight,
    resolvedSize,
    sizeExplicit = false,
    legacyWidth,
    legacyHeight,
  } = params;
  const resolvedAxis = resolvedSize || "100%";
  const hasLegacyAxisSize = vertical
    ? typeof legacyHeight === "number" && legacyHeight > 0
    : typeof legacyWidth === "number" && legacyWidth > 0;
  const lockMainAxis = sizeExplicit || hasLegacyAxisSize;

  const computedWidth = styleWidth ?? (vertical ? "100%" : lockMainAxis ? resolvedAxis : "100%");
  const computedHeight =
    styleHeight ?? (vertical ? (lockMainAxis ? resolvedAxis : "100%") : "100%");

  return { computedWidth, computedHeight };
}
