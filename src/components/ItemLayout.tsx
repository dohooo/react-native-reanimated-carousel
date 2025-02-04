import React from "react";
import type { ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle, useDerivedValue } from "react-native-reanimated";

import { TCarouselProps } from "src/types";
import type { IOpts } from "../hooks/useOffsetX";
import { useOffsetX } from "../hooks/useOffsetX";
import type { IVisibleRanges } from "../hooks/useVisibleRanges";
import type { ILayoutConfig } from "../layouts/stack";
import { useGlobalState } from "../store";

export type TAnimationStyle = NonNullable<TCarouselProps["customAnimation"]>;

export const ItemLayout: React.FC<{
  index: number;
  handlerOffset: SharedValue<number>;
  visibleRanges: IVisibleRanges;
  animationStyle: TAnimationStyle;
  children: (ctx: {
    animationValue: Animated.SharedValue<number>;
  }) => React.ReactElement;
}> = (props) => {
  const { handlerOffset, index, children, visibleRanges, animationStyle } = props;

  const {
    props: { loop, dataLength, width, height, vertical, customConfig, mode, modeConfig },
    // TODO: For dynamic dimension in the future
    // layout: { updateItemDimensions },
  } = useGlobalState();

  const size = vertical ? height : width;

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
  const animationValue = useDerivedValue(() => x.value / size, [x, size]);
  const animatedStyle = useAnimatedStyle<ViewStyle>(
    () => animationStyle(x.value / size, index),
    [animationStyle, index, x, size]
  );

  // TODO: For dynamic dimension in the future
  // function handleLayout(e: LayoutChangeEvent) {
  //   const { width, height } = e.nativeEvent.layout;
  //   updateItemDimensions(index, { width, height });
  // }

  return (
    <Animated.View
      style={[
        {
          width: width || "100%",
          height: height || "100%",
          position: "absolute",
          pointerEvents: "box-none",
        },
        animatedStyle,
      ]}
      // onLayout={handleLayout}
      /**
       * We use this testID to know when the carousel item is ready to be tested in test.
       * e.g.
       *  The testID of first item will be changed to __CAROUSEL_ITEM_0_READY__ from __CAROUSEL_ITEM_0_NOT_READY__ when the item is ready.
       * */
      testID={`__CAROUSEL_ITEM_${index}__`}
    >
      {children({ animationValue })}
    </Animated.View>
  );
};
