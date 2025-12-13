import React from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAnimatedReaction, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useAutoPlay } from "../hooks/useAutoPlay";
import { useCarouselController } from "../hooks/useCarouselController";
import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { useOnProgressChange } from "../hooks/useOnProgressChange";
import { useGlobalState } from "../store";
import { ICarouselInstance } from "../types";
import { computedRealIndexWithAutoFillData } from "../utils/computed-with-auto-fill-data";
import { ItemRenderer } from "./ItemRenderer";
import { ScrollViewGesture } from "./ScrollViewGesture";

export type TAnimationStyle = (value: number) => ViewStyle;

export const CarouselLayout = React.forwardRef<ICarouselInstance>((_props, ref) => {
  const { props, common } = useGlobalState();

  const {
    testID,
    loop,
    autoFillData,
    // Fill data with autoFillData
    data,
    // Length of fill data
    dataLength,
    // Length of raw data
    rawDataLength,
    mode,
    style,
    contentContainerStyle,
    vertical,
    autoPlay,
    windowSize,
    autoPlayReverse,
    autoPlayInterval,
    scrollAnimationDuration,
    withAnimation,
    fixedDirection,
    renderItem,
    onScrollEnd,
    onSnapToItem,
    onScrollStart,
    onProgressChange,
    customAnimation,
    defaultIndex,
  } = props;

  const { size, handlerOffset, resolvedSize, sizePhase } = common;
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
    autoFillData,
    loop,
    size,
    sizeReady: isSizeReady,
    offsetX,
    rawDataLength,
    onProgressChange,
  });

  const carouselController = useCarouselController({
    ref,
    loop,
    size,
    dataLength,
    autoFillData,
    handlerOffset,
    withAnimation,
    defaultIndex,
    fixedDirection,
    duration: scrollAnimationDuration,
    onScrollEnd: () => scheduleOnRN(_onScrollEnd),
    onScrollStart: () => !!onScrollStart && scheduleOnRN(onScrollStart),
  });

  const {
    getSharedIndex,
    // index, // Animated index. Could be used for dynamic dimension
  } = carouselController;

  const _onScrollEnd = React.useCallback(() => {
    const _sharedIndex = Math.round(getSharedIndex());

    const realIndex = computedRealIndexWithAutoFillData({
      index: _sharedIndex,
      dataLength: rawDataLength,
      loop,
      autoFillData,
    });

    if (onSnapToItem) onSnapToItem(realIndex);

    if (onScrollEnd) onScrollEnd(realIndex);
  }, [loop, autoFillData, rawDataLength, getSharedIndex, onSnapToItem, onScrollEnd]);

  const {
    start: startAutoPlay,
    pause: pauseAutoPlay,
    trigger: triggerAutoPlay,
  } = useAutoPlay({
    autoPlay,
    autoPlayInterval,
    autoPlayReverse,
    carouselController,
  });

  useAnimatedReaction(
    () => ({ ready: isSizeReady.value }),
    (state, previous) => {
      if (!autoPlay) return;
      if (state.ready === previous?.ready) return;

      if (state.ready) scheduleOnRN(triggerAutoPlay);
      else scheduleOnRN(pauseAutoPlay);
    },
    [autoPlay]
  );

  const scrollViewGestureOnScrollStart = React.useCallback(() => {
    pauseAutoPlay();
    onScrollStart?.();
  }, [onScrollStart, pauseAutoPlay]);

  const scrollViewGestureOnScrollEnd = React.useCallback(() => {
    startAutoPlay();
    _onScrollEnd();
  }, [_onScrollEnd, startAutoPlay]);

  const scrollViewGestureOnTouchBegin = React.useCallback(pauseAutoPlay, [pauseAutoPlay]);

  const scrollViewGestureOnTouchEnd = React.useCallback(startAutoPlay, [startAutoPlay]);

  const { opacity, transform, ...restContentContainerStyle } =
    StyleSheet.flatten(contentContainerStyle) || {};
  const flattenedStyle = StyleSheet.flatten(style) || {};

  const layoutStyle = useAnimatedStyle(() => {
    const { width, height } = flattenedStyle;
    const measuredSize = resolvedSize.value ?? 0;

    const computedWidth = width ?? (vertical ? "100%" : measuredSize || "100%");
    const computedHeight = height ?? (vertical ? measuredSize || "100%" : "100%");

    return {
      width: computedWidth,
      height: computedHeight,
      opacity: isSizeReady.value ? 1 : 0,
    };
  }, [flattenedStyle, isSizeReady, vertical, resolvedSize, sizePhase]);

  return (
    <GestureHandlerRootView testID={testID} style={[styles.layoutContainer, style]}>
      <ScrollViewGesture
        size={size}
        key={mode}
        translation={handlerOffset}
        style={[
          styles.contentContainer,
          layoutStyle,
          restContentContainerStyle,
          vertical ? styles.itemsVertical : styles.itemsHorizontal,
        ]}
        testID="carousel-content-container"
        onLayout={props.onLayout}
        onScrollStart={scrollViewGestureOnScrollStart}
        onScrollEnd={scrollViewGestureOnScrollEnd}
        onTouchBegin={scrollViewGestureOnTouchBegin}
        onTouchEnd={scrollViewGestureOnTouchEnd}
      >
        <ItemRenderer
          data={data}
          dataLength={dataLength}
          rawDataLength={rawDataLength}
          loop={loop}
          size={size}
          windowSize={windowSize}
          autoFillData={autoFillData}
          offsetX={offsetX}
          handlerOffset={handlerOffset}
          layoutConfig={layoutConfig}
          renderItem={renderItem}
          customAnimation={customAnimation}
        />
      </ScrollViewGesture>
    </GestureHandlerRootView>
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
