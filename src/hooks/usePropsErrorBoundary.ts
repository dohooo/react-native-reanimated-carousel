import React from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";

import type { InitializedCarouselProps } from "./useInitProps";

export function usePropsErrorBoundary(props: InitializedCarouselProps<unknown>) {
  const warned = React.useRef({
    contentStyle: false,
    missingMainAxisSize: false,
  });

  React.useEffect(() => {
    if (!__DEV__) return;

    const { contentContainerStyle, orientation, style } = props;
    const flattenedContentStyle =
      StyleSheet.flatten(contentContainerStyle as StyleProp<ViewStyle>) || {};
    if (
      (flattenedContentStyle.opacity !== undefined ||
        flattenedContentStyle.transform !== undefined) &&
      !warned.current.contentStyle
    ) {
      console.warn(
        "[react-native-reanimated-carousel] `contentContainerStyle` cannot set `opacity` or `transform`; those fields are owned by Carousel and were ignored."
      );
      warned.current.contentStyle = true;
    }

    const flattenedStyle = StyleSheet.flatten(style) || {};
    const mainAxisSize = orientation === "vertical" ? flattenedStyle.height : flattenedStyle.width;
    const hasFlexibleSize =
      (typeof flattenedStyle.flex === "number" && flattenedStyle.flex > 0) ||
      mainAxisSize !== undefined;
    if (!hasFlexibleSize && !warned.current.missingMainAxisSize) {
      console.warn(
        `[react-native-reanimated-carousel] ${orientation} Carousel has no main-axis size in \`style\`; automatic layout measurement will be used.`
      );
      warned.current.missingMainAxisSize = true;
    }
  }, [props]);
}
