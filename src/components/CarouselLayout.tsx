import React from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { useAutoPlay } from "../hooks/useAutoPlay";
import { useCarouselController } from "../hooks/useCarouselController";
import { useCommonVariables } from "../hooks/useCommonVariables";
import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { useOnProgressChange } from "../hooks/useOnProgressChange";
import { useGlobalState } from "../store";
import { ICarouselInstance } from "../types";
import { computedRealIndexWithAutoFillData } from "../utils/computed-with-auto-fill-data";
import { ItemRenderer } from "./ItemRenderer";
import { ScrollViewGesture } from "./ScrollViewGesture";

export type TAnimationStyle = (value: number) => ViewStyle;

export const CarouselLayout = React.forwardRef<ICarouselInstance>((_props, ref) => {
  const { props, layout } = useGlobalState();
  const { itemDimensions } = layout;

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
    containerStyle,
    width,
    height,
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

  const commonVariables = useCommonVariables(props);
  const { size, handlerOffset } = commonVariables;
  const layoutConfig = useLayoutConfig({ ...props, size });

  const offsetX = useDerivedValue(() => {
    const totalSize = size * dataLength;
    const x = handlerOffset.value % totalSize;

    if (!loop) return handlerOffset.value;

    return Number.isNaN(x) ? 0 : x;
  }, [loop, size, dataLength, handlerOffset]);

  useOnProgressChange({
    autoFillData,
    loop,
    size,
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
    onScrollEnd: () => runOnJS(_onScrollEnd)(),
    onScrollStart: () => !!onScrollStart && runOnJS(onScrollStart)(),
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

  const { start: startAutoPlay, pause: pauseAutoPlay } = useAutoPlay({
    autoPlay,
    autoPlayInterval,
    autoPlayReverse,
    carouselController,
  });

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

  const layoutStyle = useAnimatedStyle(() => {
    // const dimension = itemDimensions.value[index.value];

    // if (!dimension) {
    //   return {};
    // }
    return {
      // height: dimension.height, // For dynamic dimension in the future

      width: width || "100%", // [width is deprecated]
      height: height || "100%", // [height is deprecated]
    };
  }, [width, height, size, itemDimensions]);

  return (
    <GestureHandlerRootView style={[styles.layoutContainer, containerStyle]}>
      <ScrollViewGesture
        size={size}
        key={mode}
        translation={handlerOffset}
        style={[
          styles.contentContainer, // [deprecated]
          layoutStyle,
          style,
          vertical ? styles.itemsVertical : styles.itemsHorizontal,
        ]}
        testID={testID}
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
