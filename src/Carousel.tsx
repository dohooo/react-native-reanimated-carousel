import React from 'react';
import Animated, {
    runOnJS,
    runOnUI,
    useDerivedValue,
} from 'react-native-reanimated';

import { useCarouselController } from './hooks/useCarouselController';
import { useAutoPlay } from './hooks/useAutoPlay';
import { usePropsErrorBoundary } from './hooks/usePropsErrorBoundary';
import { ScrollViewGesture } from './ScrollViewGesture';
import { useVisibleRanges } from './hooks/useVisibleRanges';

import type { ICarouselInstance, TCarouselProps } from './types';
import { StyleSheet, View } from 'react-native';
import { BaseLayout } from './layouts/BaseLayout';
import { useLayoutConfig } from './hooks/useLayoutConfig';
import { useInitProps } from './hooks/useInitProps';
import { CTX } from './store';
import { useCommonVariables } from './hooks/useCommonVariables';
import { useOnProgressChange } from './hooks/useOnProgressChange';
import { computedRealIndexWithAutoFillData } from './utils/computedWithAutoFillData';

const Carousel = React.forwardRef<ICarouselInstance, TCarouselProps<any>>(
    (_props, ref) => {
        const props = useInitProps(_props);

        const {
            testID,
            data,
            rawData,
            loop,
            autoFillData,
            mode,
            style,
            width,
            height,
            vertical,
            autoPlay,
            windowSize,
            autoPlayReverse,
            autoPlayInterval,
            scrollAnimationDuration,
            withAnimation,
            renderItem,
            onScrollEnd,
            onSnapToItem,
            onScrollBegin,
            onProgressChange,
            customAnimation,
            defaultIndex,
        } = props;

        const commonVariables = useCommonVariables(props);
        const { size, handlerOffsetX } = commonVariables;
        const dataLength = data.length;

        const offsetX = useDerivedValue(() => {
            const totalSize = size * dataLength;
            const x = handlerOffsetX.value % totalSize;

            if (!loop) {
                return handlerOffsetX.value;
            }
            return isNaN(x) ? 0 : x;
        }, [loop, size, dataLength]);

        usePropsErrorBoundary(props);
        useOnProgressChange({
            autoFillData,
            loop,
            size,
            offsetX,
            rawData,
            onProgressChange,
        });

        const carouselController = useCarouselController({
            loop,
            size,
            data,
            autoFillData,
            handlerOffsetX,
            withAnimation,
            defaultIndex,
            onScrollEnd: () => runOnJS(_onScrollEnd)(),
            onScrollBegin: () => !!onScrollBegin && runOnJS(onScrollBegin)(),
            duration: scrollAnimationDuration,
        });

        const {
            sharedIndex,
            sharedPreIndex,
            to,
            next,
            prev,
            scrollTo,
            getCurrentIndex,
        } = carouselController;

        const { start: startAutoPlay, pause: pauseAutoPlay } = useAutoPlay({
            autoPlay,
            autoPlayInterval,
            autoPlayReverse,
            carouselController,
        });

        const _onScrollEnd = React.useCallback(() => {
            'worklet';
            const _sharedIndex = Math.round(sharedIndex.value) % rawData.length;
            const _sharedPreIndex =
                Math.round(sharedPreIndex.value) % rawData.length;

            if (onSnapToItem) {
                runOnJS(onSnapToItem)(_sharedIndex);
            }
            if (onScrollEnd) {
                runOnJS(onScrollEnd)(_sharedPreIndex, _sharedIndex);
            }
        }, [onSnapToItem, onScrollEnd, rawData, sharedIndex, sharedPreIndex]);

        const scrollViewGestureOnScrollBegin = React.useCallback(() => {
            pauseAutoPlay();
            onScrollBegin?.();
        }, [onScrollBegin, pauseAutoPlay]);

        const scrollViewGestureOnScrollEnd = React.useCallback(() => {
            startAutoPlay();
            /**
             * TODO magic
             */
            runOnUI(_onScrollEnd)();
        }, [_onScrollEnd, startAutoPlay]);

        const scrollViewGestureOnTouchBegin = React.useCallback(pauseAutoPlay, [
            pauseAutoPlay,
        ]);

        const scrollViewGestureOnTouchEnd = React.useCallback(startAutoPlay, [
            startAutoPlay,
        ]);

        const goToIndex = React.useCallback(
            (i: number, animated?: boolean) => {
                to(i, animated);
            },
            [to]
        );

        React.useImperativeHandle(
            ref,
            () => ({
                next,
                prev,
                getCurrentIndex,
                goToIndex,
                scrollTo,
            }),
            [getCurrentIndex, goToIndex, next, prev, scrollTo]
        );

        const visibleRanges = useVisibleRanges({
            total: data.length,
            viewSize: size,
            translation: handlerOffsetX,
            windowSize,
        });

        const layoutConfig = useLayoutConfig({ ...props, size });

        const renderLayout = React.useCallback(
            (item: any, i: number) => {
                const realIndex = computedRealIndexWithAutoFillData({
                    index: i,
                    dataLength: rawData.length,
                    loop,
                    autoFillData,
                });

                return (
                    <BaseLayout
                        key={i}
                        index={i}
                        handlerOffsetX={offsetX}
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
            },
            [
                loop,
                rawData,
                offsetX,
                visibleRanges,
                autoFillData,
                renderItem,
                layoutConfig,
                customAnimation,
            ]
        );

        return (
            <CTX.Provider value={{ props, common: commonVariables }}>
                <View
                    style={[
                        styles.container,
                        { width: width || '100%', height: height || '100%' },
                        style,
                    ]}
                    testID={testID}
                >
                    <ScrollViewGesture
                        size={size}
                        translation={handlerOffsetX}
                        onScrollBegin={scrollViewGestureOnScrollBegin}
                        onScrollEnd={scrollViewGestureOnScrollEnd}
                        onTouchBegin={scrollViewGestureOnTouchBegin}
                        onTouchEnd={scrollViewGestureOnTouchEnd}
                    >
                        <Animated.View
                            key={mode}
                            style={[
                                styles.container,
                                {
                                    width: width || '100%',
                                    height: height || '100%',
                                },
                                style,
                                vertical
                                    ? styles.itemsVertical
                                    : styles.itemsHorizontal,
                            ]}
                        >
                            {data.map(renderLayout)}
                        </Animated.View>
                    </ScrollViewGesture>
                </View>
            </CTX.Provider>
        );
    }
);

export default Carousel as <T extends any>(
    props: React.PropsWithChildren<TCarouselProps<T>>
) => React.ReactElement;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    itemsHorizontal: {
        flexDirection: 'row',
    },
    itemsVertical: {
        flexDirection: 'column',
    },
});
