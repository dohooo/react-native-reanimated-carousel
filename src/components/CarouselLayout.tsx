import React from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { useAnimatedReaction, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useAutoPlay } from "../hooks/useAutoPlay";
import { useCarouselController } from "../hooks/useCarouselController";
import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { useOnProgressChange } from "../hooks/useOnProgressChange";
import { useGlobalState } from "../store";
import type { CarouselRef } from "../types";
import { ItemRenderer } from "./ItemRenderer";
import { ScrollViewGesture } from "./ScrollViewGesture";

export function resolveCarouselLayoutStyle(params: {
  flattenedStyle: Partial<ViewStyle>;
  isVertical: boolean;
  measuredSize: number;
  sizeExplicit: boolean;
}) {
  "worklet";

  const { flattenedStyle, isVertical, measuredSize, sizeExplicit } = params;
  const { width, height } = flattenedStyle;
  const resolvedMainAxisSize = measuredSize || "100%";

  return {
    width: width ?? (isVertical ? "100%" : sizeExplicit ? resolvedMainAxisSize : "100%"),
    height: height ?? (isVertical ? (sizeExplicit ? resolvedMainAxisSize : "100%") : "100%"),
  };
}

export const CarouselLayout = React.forwardRef<CarouselRef>((_props, ref) => {
  const { props, common } = useGlobalState();

  const {
    testID,
    loop,
    autoFillData,
    // Fill data with autoFillData
    data,
    rawData,
    // Length of fill data
    dataLength,
    // Length of raw data
    rawDataLength,
    layout,
    style,
    contentContainerStyle,
    orientation,
    autoplay,
    renderWindowSize,
    autoplayDirection,
    autoplayInterval,
    animation,
    renderItem,
    onSnapToItem,
    onScrollStart,
    onProgressChange,
    progress,
    itemAnimation,
    defaultIndex,
    keyExtractor,
  } = props;
  const isVertical = orientation === "vertical";

  const { size, handlerOffset, resolvedSize, sizePhase, sizeExplicit } = common;
  const layoutConfig = useLayoutConfig({ ...props, size });

  const isSizeReady = useDerivedValue(() => {
    const currentSize = resolvedSize.value ?? 0;
    return sizePhase.value === "ready" && currentSize > 0;
  }, [resolvedSize, sizePhase]);

  const offsetX = useDerivedValue(() => {
    const currentSize = resolvedSize.value ?? 0;
    if (currentSize <= 0) return 0;

    const totalSize = currentSize * dataLength;
    const value = handlerOffset.value;
    if (!loop || totalSize === 0) {
      return value;
    }

    const x = value % totalSize;
    return Number.isNaN(x) ? 0 : x;
  }, [loop, dataLength, handlerOffset, resolvedSize]);

  useOnProgressChange({
    loop,
    offset: handlerOffset,
    progress,
    size,
    sizeReady: isSizeReady,
    rawDataLength,
    onProgressChange,
  });

  const _onScrollEnd = React.useCallback(
    (realIndex: number) => {
      if (onSnapToItem) onSnapToItem(realIndex);
    },
    [onSnapToItem]
  );

  const carouselController = useCarouselController({
    ref,
    loop,
    size,
    dataLength,
    rawDataLength,
    handlerOffset,
    animation,
    defaultIndex,
    onMovementEnd: _onScrollEnd,
    onScrollStart,
  });

  const {
    start: startAutoPlay,
    pause: pauseAutoPlay,
    trigger: triggerAutoPlay,
  } = useAutoPlay({
    autoplay,
    autoplayDirection,
    autoplayInterval,
    carouselController,
  });

  useAnimatedReaction(
    () => ({ ready: isSizeReady.value }),
    (state, previous) => {
      if (!autoplay) return;
      if (state.ready === previous?.ready) return;

      if (state.ready) scheduleOnRN(triggerAutoPlay);
      else scheduleOnRN(pauseAutoPlay);
    },
    [autoplay]
  );

  const scrollViewGestureOnScrollStart = React.useCallback(() => {
    carouselController.startMovement();
    pauseAutoPlay();
    onScrollStart?.();
  }, [carouselController, onScrollStart, pauseAutoPlay]);

  const scrollViewGestureOnScrollEnd = React.useCallback(() => {
    const settledIndex = carouselController.settle();
    startAutoPlay();
    _onScrollEnd(settledIndex);
  }, [_onScrollEnd, carouselController, startAutoPlay]);

  const scrollViewGestureOnTouchBegin = React.useCallback(pauseAutoPlay, [pauseAutoPlay]);

  const scrollViewGestureOnTouchEnd = React.useCallback(startAutoPlay, [startAutoPlay]);

  const { opacity, transform, ...restContentContainerStyle } =
    StyleSheet.flatten(contentContainerStyle as StyleProp<ViewStyle>) || {};
  const flattenedStyle = StyleSheet.flatten(style) || {};

  const layoutStyle = useAnimatedStyle(() => {
    const measuredSize = resolvedSize.value ?? 0;
    const { width, height } = resolveCarouselLayoutStyle({
      flattenedStyle,
      isVertical,
      measuredSize,
      sizeExplicit,
    });

    return {
      width,
      height,
      opacity: isSizeReady.value ? 1 : 0,
    };
  }, [flattenedStyle, isSizeReady, isVertical, resolvedSize, sizePhase, sizeExplicit]);

  return (
    <View testID={testID} style={[styles.layoutContainer, style]} onLayout={props.onLayout}>
      <ScrollViewGesture
        size={size}
        key={layout?.type}
        translation={handlerOffset}
        style={[
          styles.contentContainer,
          layoutStyle,
          restContentContainerStyle,
          isVertical ? styles.itemsVertical : styles.itemsHorizontal,
        ]}
        testID="carousel-content-container"
        onScrollStart={scrollViewGestureOnScrollStart}
        onScrollEnd={scrollViewGestureOnScrollEnd}
        onTouchBegin={scrollViewGestureOnTouchBegin}
        onTouchEnd={scrollViewGestureOnTouchEnd}
      >
        <ItemRenderer
          data={data}
          rawData={rawData}
          dataLength={dataLength}
          rawDataLength={rawDataLength}
          loop={loop}
          size={size}
          renderWindowSize={renderWindowSize}
          defaultIndex={defaultIndex}
          autoFillData={autoFillData}
          offsetX={offsetX}
          handlerOffset={handlerOffset}
          layoutConfig={layoutConfig}
          renderItem={renderItem}
          itemAnimation={itemAnimation}
          keyExtractor={keyExtractor}
        />
      </ScrollViewGesture>
    </View>
  );
});

const styles = StyleSheet.create({
  layoutContainer: {
    display: "flex",
    overflow: "hidden",
  },
  contentContainer: {
    overflow: "hidden",
  },
  itemsHorizontal: {
    flexDirection: "row",
  },
  itemsVertical: {
    flexDirection: "column",
  },
});
