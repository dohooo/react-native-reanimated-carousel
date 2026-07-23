import React from "react";
import type { LayoutChangeEvent, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

import type { OffsetOptions } from "../hooks/useOffsetX";
import { useOffsetX } from "../hooks/useOffsetX";
import type { VisibleRangesValue } from "../hooks/useVisibleRanges";
import { useGlobalState } from "../store";
import type { CarouselItemAnimation } from "../types";
import { positiveModulo } from "../utils/carousel-math";
import { sanitizeAnimationStyle } from "../utils/sanitize-animation-style";

export type ItemAnimationStyle = CarouselItemAnimation;

export function resolveItemMainAxisSize(params: {
  explicitSize?: number;
  effectivePageSize?: number;
  measuredSize: number | null;
}) {
  "worklet";

  const { explicitSize, effectivePageSize, measuredSize } = params;

  return typeof explicitSize === "number"
    ? explicitSize
    : (effectivePageSize ?? measuredSize ?? "100%");
}

export const ItemLayout: React.FC<{
  index: number;
  rawIndex: number;
  handlerOffset: SharedValue<number>;
  visibleRanges: VisibleRangesValue;
  animationStyle: ItemAnimationStyle;
  children: (ctx: {
    relativeProgress: SharedValue<number>;
  }) => React.ReactElement;
}> = (props) => {
  const { handlerOffset, index, rawIndex, children, visibleRanges, animationStyle } = props;

  const {
    props: { loop, dataLength, orientation, layout, style, itemSize },
    common,
    layout: { updateItemDimensions },
  } = useGlobalState();

  const measuredSize = useSharedValue<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });

  const fallbackSize = common.size;
  const isVertical = orientation === "vertical";
  const { width: styleWidth, height: styleHeight } = StyleSheet.flatten(style) || {};
  const styleWidthNumber = typeof styleWidth === "number" ? styleWidth : undefined;
  const styleHeightNumber = typeof styleHeight === "number" ? styleHeight : undefined;

  const size = (itemSize ?? fallbackSize) || 0;
  const effectivePageSize = size > 0 ? size : undefined;

  const dimensionsStyle = useAnimatedStyle<ViewStyle>(() => {
    const widthCandidate = isVertical ? styleWidthNumber : itemSize;
    const heightCandidate = isVertical ? itemSize : styleHeightNumber;

    const computedWidth = isVertical
      ? typeof widthCandidate === "number"
        ? widthCandidate
        : (measuredSize.value.width ?? "100%")
      : resolveItemMainAxisSize({
          explicitSize: widthCandidate,
          effectivePageSize,
          measuredSize: measuredSize.value.width,
        });

    const computedHeight = isVertical
      ? resolveItemMainAxisSize({
          explicitSize: heightCandidate,
          effectivePageSize,
          measuredSize: measuredSize.value.height,
        })
      : typeof heightCandidate === "number"
        ? heightCandidate
        : (measuredSize.value.height ?? "100%");

    return {
      width: computedWidth,
      height: computedHeight,
    };
  }, [effectivePageSize, isVertical, itemSize, styleHeightNumber, styleWidthNumber]);

  let offsetXConfig: OffsetOptions = {
    handlerOffset,
    index,
    size,
    dataLength,
    loop,
  };

  if (layout?.type === "horizontal-stack") {
    offsetXConfig = {
      handlerOffset,
      index,
      size,
      dataLength,
      loop,
      type: layout.exitDirection === "right" ? "negative" : "positive",
      viewCount: layout.visibleCount,
    };
  }

  const x = useOffsetX(offsetXConfig, visibleRanges);
  const isCurrentForAccessibility = React.useCallback(
    () =>
      size > 0 &&
      dataLength > 0 &&
      positiveModulo(Math.round(-handlerOffset.value / size), dataLength) === index,
    [dataLength, handlerOffset, index, size]
  );
  const [isAccessibilityCurrent, setIsAccessibilityCurrent] =
    React.useState(isCurrentForAccessibility);

  useAnimatedReaction(
    isCurrentForAccessibility,
    (isCurrent, wasCurrent) => {
      if (isCurrent !== wasCurrent) {
        scheduleOnRN(setIsAccessibilityCurrent, isCurrent);
      }
    },
    [isCurrentForAccessibility]
  );

  const relativeProgress = useDerivedValue(() => {
    if (!size) return 0;
    return x.value / size;
  }, [x, size]);
  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const safeSize = size || 1;
    return sanitizeAnimationStyle(animationStyle(x.value / safeSize, rawIndex));
  }, [animationStyle, rawIndex, x, size]);

  // TODO: For dynamic dimension in the future
  // function handleLayout(e: LayoutChangeEvent) {
  //   const { width, height } = e.nativeEvent.layout;
  //   updateItemDimensions(index, { width, height });
  // }

  const child = children({ relativeProgress });

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
      accessibilityElementsHidden={!isAccessibilityCurrent}
      accessible={isAccessibilityCurrent ? undefined : false}
      aria-hidden={!isAccessibilityCurrent}
      importantForAccessibility={isAccessibilityCurrent ? "auto" : "no-hide-descendants"}
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
