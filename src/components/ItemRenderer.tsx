import React from "react";
import type { FC } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { ItemAnimationStyle } from "./ItemLayout";
import { ItemLayout } from "./ItemLayout";

import type { VisibleRanges } from "../hooks/useVisibleRanges";
import {
  computeVisibleRanges,
  normalizeWindowSize,
  useVisibleRanges,
} from "../hooks/useVisibleRanges";
import type { CarouselItemAnimation, CarouselRenderItem } from "../types";
import { computedRealIndexWithAutoFillData } from "../utils/computed-with-auto-fill-data";
import { webOnlyDependencies } from "../utils/web-only-dependencies";

interface Props {
  data: unknown[];
  rawData: unknown[];
  dataLength: number;
  rawDataLength: number;
  loop: boolean;
  size: number;
  renderWindowSize?: number | undefined;
  defaultIndex: number;
  autoFillData: boolean;
  offsetX: SharedValue<number>;
  handlerOffset: SharedValue<number>;
  layoutConfig: ItemAnimationStyle;
  renderItem: CarouselRenderItem<unknown>;
  itemAnimation?: CarouselItemAnimation | undefined;
  keyExtractor?: ((item: unknown, index: number) => string) | undefined;
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

  // When the window covers every item, the ranges always span the whole list. Skip them so a
  // stale range from before a data change cannot unmount keyed items for one render.
  const rendersAllItems = normalizeWindowSize(dataLength, renderWindowSize) >= dataLength;

  useAnimatedReaction(
    () => visibleRanges.value,
    (ranges) => scheduleOnRN(setDisplayedItems, ranges),
    webOnlyDependencies([visibleRanges])
  );

  // With a render window, the ranges still describe the previous data for the renders between a
  // data change and the next range update. Keep the keyed items mounted with the last up-to-date
  // ranges until then, so an item that shifted index is not unmounted and mounted again.
  const lastSettledRender = React.useRef<{
    data: unknown[];
    ranges: VisibleRanges;
    keys: ReadonlySet<string>;
  } | null>(null);
  const settled = lastSettledRender.current;
  const rangesAreStale =
    !!keyExtractor && !!settled && settled.ranges === displayedItems && settled.data !== data;
  const renderedKeys = new Set<string>();

  React.useEffect(() => {
    if (rangesAreStale) return;
    lastSettledRender.current = { data, ranges: displayedItems, keys: renderedKeys };
  });

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

        const isInRange =
          rendersAllItems ||
          (index >= negativeRange[0] && index <= negativeRange[1]) ||
          (index >= positiveRange[0] && index <= positiveRange[1]);

        if (!isInRange && !rangesAreStale) return null;

        const rawItem = rawData[realIndex] ?? item;
        const key = keyExtractor
          ? `${keyExtractor(rawItem, realIndex)}::rnrc-copy-${Math.floor(
              index / Math.max(rawDataLength, 1)
            )}`
          : String(index);

        if (!isInRange && !settled?.keys.has(key)) return null;

        renderedKeys.add(key);

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
