import React from "react";
import type { FC } from "react";
import type { ViewStyle } from "react-native";
import type Animated from "react-native-reanimated";
import { useAnimatedReaction, type AnimatedStyleProp, runOnJS } from "react-native-reanimated";

import type { TAnimationStyle } from "./BaseLayout";
import { BaseLayout } from "./BaseLayout";

import type { VisibleRanges } from "../hooks/useVisibleRanges";
import { useVisibleRanges } from "../hooks/useVisibleRanges";
import type { CarouselRenderItem } from "../types";
import { computedRealIndexWithAutoFillData } from "../utils/computed-with-auto-fill-data";

interface Props {
  data: any[]
  dataLength: number
  rawDataLength: number
  loop: boolean
  size: number
  windowSize?: number
  autoFillData: boolean
  offsetX: Animated.SharedValue<number>
  handlerOffset: Animated.SharedValue<number>
  layoutConfig: TAnimationStyle
  renderItem: CarouselRenderItem<any>
  customAnimation?: ((value: number) => AnimatedStyleProp<ViewStyle>)
}

export const ItemRenderer: FC<Props> = (props) => {
  const {
    data,
    size,
    windowSize,
    handlerOffset,
    offsetX,
    dataLength,
    rawDataLength,
    loop,
    autoFillData,
    layoutConfig,
    renderItem,
    customAnimation,
  } = props;

  const visibleRanges = useVisibleRanges({
    total: dataLength,
    viewSize: size,
    translation: handlerOffset,
    windowSize,
    loop,
  });

  const [displayedItems, setDisplayedItems] = React.useState<VisibleRanges>(null!);

  useAnimatedReaction(
    () => visibleRanges.value,
    ranges => runOnJS(setDisplayedItems)(ranges),
    [visibleRanges],
  );

  if (!displayedItems)
    return null;

  return (
    <>
      {
        data.map((item, index) => {
          const realIndex = computedRealIndexWithAutoFillData({
            index,
            dataLength: rawDataLength,
            loop,
            autoFillData,
          });

          const { negativeRange, positiveRange } = displayedItems;

          const shouldRender = (index >= negativeRange[0] && index <= negativeRange[1])
          || (index >= positiveRange[0] && index <= positiveRange[1]);

          if (!shouldRender)
            return null;

          return (
            <BaseLayout
              key={index}
              index={index}
              handlerOffset={offsetX}
              visibleRanges={visibleRanges}
              animationStyle={customAnimation || layoutConfig}
            >
              {({ animationValue }) =>
                renderItem({
                  item,
                  index: realIndex,
                  animationValue,
                })
              }
            </BaseLayout>
          );
        })
      }
    </>
  );
};
