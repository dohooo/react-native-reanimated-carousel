import React from "react";
import type { LayoutChangeEvent, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";

import type { IOpts } from "../hooks/useOffsetX";
import { useOffsetX } from "../hooks/useOffsetX";
import type { IVisibleRanges } from "../hooks/useVisibleRanges";
import type { ILayoutConfig } from "../layouts/stack";
import { useGlobalState } from "../store";
import type { TCarouselProps } from "../types";
import { sanitizeAnimationStyle } from "../utils/sanitize-animation-style";

export type TAnimationStyle = NonNullable<TCarouselProps["customAnimation"]>;

export const ItemLayout: React.FC<{
  index: number;
  handlerOffset: SharedValue<number>;
  visibleRanges: IVisibleRanges;
  animationStyle: TAnimationStyle;
  children: (ctx: {
    animationValue: SharedValue<number>;
  }) => React.ReactElement;
}> = (props) => {
  const { handlerOffset, index, children, visibleRanges, animationStyle } = props;

  const {
    props: {
      loop,
      dataLength,
      width,
      height,
      vertical,
      customConfig,
      mode,
      modeConfig,
      style,
      itemWidth,
      itemHeight,
    },
    common,
    layout: { updateItemDimensions },
  } = useGlobalState();

  const measuredSize = useSharedValue<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });

  const fallbackSize = common.size;
  // Prefer size from `style` (v5), then fallback to deprecated `width`/`height` for v4 compatibility.
  const { width: styleWidth, height: styleHeight } = StyleSheet.flatten(style) || {};
  const styleWidthNumber = typeof styleWidth === "number" ? styleWidth : undefined;
  const styleHeightNumber = typeof styleHeight === "number" ? styleHeight : undefined;

  // When itemWidth/itemHeight is provided, use it for item dimensions (not container style)
  const explicitItemSize = vertical ? itemHeight : itemWidth;
  const explicitAxisSize = vertical ? (styleHeightNumber ?? height) : (styleWidthNumber ?? width);
  // Use itemWidth/itemHeight if provided, otherwise fall back to container size
  const size = (explicitItemSize ?? explicitAxisSize ?? fallbackSize) || 0;
  const effectivePageSize = size > 0 ? size : undefined;

  const dimensionsStyle = useAnimatedStyle<ViewStyle>(() => {
    // When itemWidth/itemHeight is provided, use it for item width/height
    const widthCandidate = vertical ? width : (explicitItemSize ?? explicitAxisSize);
    const heightCandidate = vertical ? (explicitItemSize ?? explicitAxisSize) : height;

    const computedWidth =
      typeof widthCandidate === "number"
        ? widthCandidate
        : (measuredSize.value.width ?? (vertical ? "100%" : (effectivePageSize ?? "100%")));

    const computedHeight =
      typeof heightCandidate === "number"
        ? heightCandidate
        : (measuredSize.value.height ?? (vertical ? (effectivePageSize ?? "100%") : "100%"));

    return {
      width: computedWidth,
      height: computedHeight,
    };
  }, [vertical, width, height, explicitAxisSize, explicitItemSize, effectivePageSize]);

  let offsetXConfig: IOpts = {
    handlerOffset,
    index,
    size,
    dataLength,
    loop,
    ...(typeof customConfig === "function" ? customConfig() : {}),
  };

  if (mode === "horizontal-stack") {
    const { snapDirection, showLength } = modeConfig as ILayoutConfig;

    offsetXConfig = {
      handlerOffset,
      index,
      size,
      dataLength,
      loop,
      type: snapDirection === "right" ? "negative" : "positive",
      viewCount: showLength,
    };
  }

  const x = useOffsetX(offsetXConfig, visibleRanges);
  const animationValue = useDerivedValue(() => {
    if (!size) return 0;
    return x.value / size;
  }, [x, size]);
  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const safeSize = size || 1;
    return sanitizeAnimationStyle(animationStyle(x.value / safeSize, index));
  }, [animationStyle, index, x, size]);

  // TODO: For dynamic dimension in the future
  // function handleLayout(e: LayoutChangeEvent) {
  //   const { width, height } = e.nativeEvent.layout;
  //   updateItemDimensions(index, { width, height });
  // }

  const child = children({ animationValue });

  type LayoutableProps = {
    collapsable?: boolean;
    onLayout?: (event: LayoutChangeEvent) => void;
  };

  const enhancedChild = React.isValidElement<LayoutableProps>(child)
    ? React.cloneElement(child, {
        collapsable: false,
        onLayout: (event: LayoutChangeEvent) => {
          const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
          if (layoutWidth > 0 && layoutHeight > 0) {
            scheduleOnUI(() => {
              const { width: prevWidth, height: prevHeight } = measuredSize.value;
              if (prevWidth === layoutWidth && prevHeight === layoutHeight) return;

              measuredSize.value = {
                width: layoutWidth,
                height: layoutHeight,
              };
              updateItemDimensions(index, {
                width: layoutWidth,
                height: layoutHeight,
              });
            });
          }

          child.props?.onLayout?.(event);
        },
      })
    : child;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          pointerEvents: "box-none",
        },
        dimensionsStyle,
        animatedStyle,
      ]}
      /**
       * We use this testID to know when the carousel item is ready to be tested in test.
       * e.g.
       *  The testID of first item will be changed to __CAROUSEL_ITEM_0_READY__ from __CAROUSEL_ITEM_0_NOT_READY__ when the item is ready.
       * */
      testID={`__CAROUSEL_ITEM_${index}__`}
    >
      {enhancedChild}
    </Animated.View>
  );
};
