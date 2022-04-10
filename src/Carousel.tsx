import React from 'react';
import Animated, { runOnJS, useDerivedValue } from 'react-native-reanimated';

import { useCarouselController } from './hooks/useCarouselController';
import { useAutoPlay } from './hooks/useAutoPlay';
import { usePropsErrorBoundary } from './hooks/usePropsErrorBoundary';
import { ScrollViewGesture } from './ScrollViewGesture';
import { useVisibleRanges } from './hooks/useVisibleRanges';

import type { ICarouselInstance, TCarouselProps } from './types';
import { StyleSheet, View } from 'react-native';
import { DATA_LENGTH } from './constants';
import { BaseLayout } from './layouts/BaseLayout';
import { useLayoutConfig } from './hooks/useLayoutConfig';
import { useInitProps } from './hooks/useInitProps';
import { CTX } from './store';
import { useCommonVariables } from './hooks/useCommonVariables';
import { useOnProgressChange } from './hooks/useOnProgressChange';

const Carousel = React.forwardRef<ICarouselInstance, TCarouselProps<any>>(
    (_props, ref) => {
        const props = useInitProps(_props);

        const {
            data,
            rawData,
            loop,
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
        useOnProgressChange({ size, offsetX, rawData, onProgressChange });

        const carouselController = useCarouselController({
            loop,
            size,
            handlerOffsetX,
            length: data.length,
            disable: !data.length,
            withAnimation,
            originalLength: data.length,
            defaultIndex,
            onScrollEnd: () => runOnJS(_onScrollEnd)(),
            onScrollBegin: () => !!onScrollBegin && runOnJS(onScrollBegin)(),
            onChange: (i) => !!onSnapToItem && runOnJS(onSnapToItem)(i),
            duration: scrollAnimationDuration,
        });

        const {
            next,
            prev,
            sharedPreIndex,
            sharedIndex,
            computedIndex,
            getCurrentIndex,
        } = carouselController;

        const { start, pause } = useAutoPlay({
            autoPlay,
            autoPlayInterval,
            autoPlayReverse,
            carouselController,
        });

        const _onScrollEnd = React.useCallback(() => {
            computedIndex();
            onScrollEnd?.(sharedPreIndex.current, sharedIndex.current);
        }, [sharedPreIndex, sharedIndex, computedIndex, onScrollEnd]);

        const scrollViewGestureOnScrollBegin = React.useCallback(() => {
            pause();
            onScrollBegin?.();
        }, [onScrollBegin, pause]);

        const scrollViewGestureOnScrollEnd = React.useCallback(() => {
            start();
            _onScrollEnd();
        }, [_onScrollEnd, start]);

        const scrollViewGestureOnTouchBegin = React.useCallback(pause, [pause]);

        const scrollViewGestureOnTouchEnd = React.useCallback(start, [start]);

        const goToIndex = React.useCallback(
            (i: number, animated?: boolean) => {
                carouselController.to(i, animated);
            },
            [carouselController]
        );

        React.useImperativeHandle(
            ref,
            () => ({
                next,
                prev,
                getCurrentIndex,
                goToIndex,
                scrollTo: carouselController.scrollTo,
            }),
            [
                getCurrentIndex,
                goToIndex,
                next,
                prev,
                carouselController.scrollTo,
            ]
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
                let realIndex = i;
                if (rawData.length === DATA_LENGTH.SINGLE_ITEM) {
                    realIndex = i % 1;
                }

                if (rawData.length === DATA_LENGTH.DOUBLE_ITEM) {
                    realIndex = i % 2;
                }

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
                rawData,
                offsetX,
                visibleRanges,
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
