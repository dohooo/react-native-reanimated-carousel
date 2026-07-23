import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import type { PaginationProps } from "../../public-types";
import { PaginationItem } from "./PaginationItem";

const numericStyleFields = ["width", "height", "borderRadius", "borderWidth", "opacity"] as const;

function validateDotStyle(name: "activeDotStyle" | "dotStyle", style: PaginationProps["dotStyle"]) {
  if (!style) return;

  for (const field of numericStyleFields) {
    const value = style[field];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(
        `[react-native-reanimated-carousel] Pagination ${name}.${field} must be a finite number.`
      );
    }
  }

  if ((style.width ?? 1) <= 0 || (style.height ?? 1) <= 0) {
    throw new Error(
      `[react-native-reanimated-carousel] Pagination ${name} width and height must be positive.`
    );
  }
  if ((style.borderRadius ?? 0) < 0 || (style.borderWidth ?? 0) < 0) {
    throw new Error(
      `[react-native-reanimated-carousel] Pagination ${name} borderRadius and borderWidth must be non-negative.`
    );
  }
  if (style.opacity !== undefined && (style.opacity < 0 || style.opacity > 1)) {
    throw new Error(
      `[react-native-reanimated-carousel] Pagination ${name}.opacity must be between 0 and 1.`
    );
  }
}

export function Pagination(props: PaginationProps) {
  const {
    activeDotStyle,
    containerStyle,
    count,
    dotStyle,
    orientation = "horizontal",
    progress,
  } = props;

  if (!Number.isInteger(count) || count < 0) {
    throw new Error(
      "[react-native-reanimated-carousel] Pagination count must be a non-negative integer."
    );
  }
  validateDotStyle("dotStyle", dotStyle);
  validateDotStyle("activeDotStyle", activeDotStyle);

  const warnedProtectedStyle = React.useRef(false);
  const flattenedContainerStyle = (StyleSheet.flatten(containerStyle) ?? {}) as ViewStyle;
  const {
    direction: protectedDirection,
    flexDirection: protectedFlexDirection,
    ...safeContainerStyle
  } = flattenedContainerStyle;

  if (
    __DEV__ &&
    !warnedProtectedStyle.current &&
    (protectedDirection !== undefined || protectedFlexDirection !== undefined)
  ) {
    warnedProtectedStyle.current = true;
    console.warn(
      "[react-native-reanimated-carousel] Pagination containerStyle cannot override direction or flexDirection; those fields were ignored."
    );
  }

  if (count === 0) return null;

  const onPress = props.onPress;
  const getItemAccessibilityLabel =
    typeof onPress === "function" ? props.getItemAccessibilityLabel : undefined;

  return (
    <View
      style={[
        safeContainerStyle,
        {
          flexDirection: orientation === "vertical" ? "column" : "row",
        },
      ]}
    >
      {Array.from({ length: count }, (_, index) => (
        <PaginationItem
          key={index}
          activeDotStyle={activeDotStyle}
          count={count}
          dotStyle={dotStyle}
          index={index}
          label={getItemAccessibilityLabel?.(index, count)}
          onPress={onPress}
          progress={progress}
        />
      ))}
    </View>
  );
}
