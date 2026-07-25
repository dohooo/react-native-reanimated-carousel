import React from "react";
import type { FC } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { ItemAnimationStyle } from "./ItemLayout";
import { ItemLayout } from "./ItemLayout";

import type { VisibleRanges } from "../hooks/useVisibleRanges";
import { computeVisibleRanges, useVisibleRanges } from "../hooks/useVisibleRanges";
import type { CarouselItemAnimation, CarouselRenderItem } from "../types";
import { computedRealIndexWithAutoFillData } from "../utils/computed-with-auto-fill-data";

interface Props {
  data: unknown[];
  rawData: unknown[];
  dataLength: number;
  rawDataLength: number;
  loop: boolean;
  size: number;
  renderWindowSize?: number;
  defaultIndex: number;
  autoFillData: boolean;
  offsetX: SharedValue<number>;
  handlerOffset: SharedValue<number>;
  layoutConfig: ItemAnimationStyle;
  renderItem: CarouselRenderItem<unknown>;
  itemAnimation?: CarouselItemAnimation;
  keyExtractor?: (item: unknown, index: number) => string;
}

export const ItemRenderer: FC<Props> = (props) => {
  const {
    data,
    rawData,
    size,
    renderWindowSize,
    defaultIndex,
    handlerOffset,
    offsetX,
    dataLength,
    rawDataLength,
    loop,
    autoFillData,
    layoutConfig,
    renderItem,
    itemAnimation,
    keyExtractor,
  } = props;

  const visibleRanges = useVisibleRanges({
    total: dataLength,
    viewSize: size,
    translation: handlerOffset,
    windowSize: renderWindowSize,
    loop,
  });

  // Initialize with a sensible default to avoid blank render on first frame
  const initialRanges: VisibleRanges = React.useMemo(
    () =>
      computeVisibleRanges({
        total: dataLength,
        windowSize: renderWindowSize,
        currentIndex: defaultIndex,
        loop,
      }),
    [dataLength, defaultIndex, loop, renderWindowSize]
  );

  const [displayedItems, setDisplayedItems] = React.useState<VisibleRanges>(initialRanges);

  useAnimatedReaction(
    () => visibleRanges.value,
    (ranges) => scheduleOnRN(setDisplayedItems, ranges),
    [visibleRanges]
  );

  return (
    <>
      {data.map((item, index) => {
        const realIndex = computedRealIndexWithAutoFillData({
          index,
          dataLength: rawDataLength,
          loop,
          autoFillData,
        });

        const { negativeRange, positiveRange } = displayedItems;

        const shouldRender =
          (index >= negativeRange[0] && index <= negativeRange[1]) ||
          (index >= positiveRange[0] && index <= positiveRange[1]);

        if (!shouldRender) return null;

        const rawItem = rawData[realIndex] ?? item;
        const key = keyExtractor
          ? `${keyExtractor(rawItem, realIndex)}::rnrc-copy-${Math.floor(
              index / Math.max(rawDataLength, 1)
            )}`
          : String(index);

        return (
          <ItemLayout
            key={key}
            index={index}
            rawIndex={realIndex}
            handlerOffset={offsetX}
            visibleRanges={visibleRanges}
            animationStyle={itemAnimation || layoutConfig}
          >
            {({ relativeProgress }) =>
              renderItem({
                item: rawItem,
                index: realIndex,
                relativeProgress,
              })
            }
          </ItemLayout>
        );
      })}
    </>
  );
};
