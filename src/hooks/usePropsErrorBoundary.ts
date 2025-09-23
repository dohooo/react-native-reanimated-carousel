import React from "react";

import type { TCarouselProps } from "../types";

export function usePropsErrorBoundary(props: TCarouselProps & { dataLength: number }) {
  React.useEffect(() => {
    const { defaultIndex, dataLength: viewCount } = props;

    if (typeof defaultIndex === "number" && viewCount > 0) {
      if (defaultIndex < 0 || defaultIndex >= viewCount) {
        throw new Error("DefaultIndex must be in the range of data length.");
      }
    }

    // When the developer does not explicitly specify the main axis size, it will be automatically filled during runtime through layout measurement.
    // Therefore, the exception is no longer forced to be thrown, only prompted once in development mode.
    if (__DEV__) {
      if (!props.vertical && !props.width && !warnedRefs.horizontal) {
        console.warn(
          "[react-native-reanimated-carousel] Horizontal mode did not specify `width`, will fall back to automatic measurement mode."
        );
        warnedRefs.horizontal = true;
      }
      if (props.vertical && !props.height && !warnedRefs.vertical) {
        console.warn(
          "[react-native-reanimated-carousel] Vertical mode did not specify `height`, will fall back to automatic measurement mode."
        );
        warnedRefs.vertical = true;
      }
    }
  }, [props]);
}

const warnedRefs: { horizontal: boolean; vertical: boolean } = {
  horizontal: false,
  vertical: false,
};
