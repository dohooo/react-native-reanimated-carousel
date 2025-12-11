import React from "react";
import { StyleSheet } from "react-native";

import type { TCarouselProps } from "../types";

export function usePropsErrorBoundary(props: TCarouselProps & { dataLength: number }) {
  React.useEffect(() => {
    const { defaultIndex, dataLength: viewCount } = props;

    if (typeof defaultIndex === "number" && viewCount > 0) {
      if (defaultIndex < 0 || defaultIndex >= viewCount) {
        throw new Error("DefaultIndex must be in the range of data length.");
      }
    }

    if (__DEV__) {
      const { style, vertical, width, height, contentContainerStyle } = props;
      const { width: styleWidth, height: styleHeight } = StyleSheet.flatten(style) || {};

      // Deprecation warnings for width/height props
      if (typeof width === "number" && !warnedRefs.width) {
        console.warn(
          "[react-native-reanimated-carousel] The `width` prop is deprecated. Please use `style={{ width: ... }}` instead."
        );
        warnedRefs.width = true;
      }
      if (typeof height === "number" && !warnedRefs.height) {
        console.warn(
          "[react-native-reanimated-carousel] The `height` prop is deprecated. Please use `style={{ height: ... }}` instead."
        );
        warnedRefs.height = true;
      }

      // Conflict warning for contentContainerStyle
      const { opacity, transform } = StyleSheet.flatten(contentContainerStyle) || {};
      if ((opacity !== undefined || transform !== undefined) && !warnedRefs.conflict) {
        console.warn(
          "[react-native-reanimated-carousel] Do not set 'opacity' or 'transform' on 'contentContainerStyle' as it may conflict with animations."
        );
        warnedRefs.conflict = true;
      }

      // Updated missing size warnings
      if (!vertical && !width && !styleWidth && !warnedRefs.horizontal) {
        console.warn(
          "[react-native-reanimated-carousel] Horizontal mode did not specify `width` in `style`, will fall back to automatic measurement mode."
        );
        warnedRefs.horizontal = true;
      }
      if (vertical && !height && !styleHeight && !warnedRefs.vertical) {
        console.warn(
          "[react-native-reanimated-carousel] Vertical mode did not specify `height` in `style`, will fall back to automatic measurement mode."
        );
        warnedRefs.vertical = true;
      }
    }
  }, [props]);
}

const warnedRefs: { [key: string]: boolean } = {
  horizontal: false,
  vertical: false,
  width: false,
  height: false,
  conflict: false,
};
