import React, { PropsWithChildren } from 'react';
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

function Carousel<T>(
    _props: PropsWithChildren<TCarouselProps<T>>,
    ref: React.Ref<ICarouselInstance>
) {
    const props = useInitProps(_props);

    const {
        data,
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
        renderItem,
        onScrollEnd,
        onSnapToItem,
        onScrollBegin,
        onProgressChange,
        customAnimation,
    } = props;

    const commonVariables = useCommonVariables(props);
    const { size, handlerOffsetX } = commonVariables;

    const offsetX = useDerivedValue(() => {
        const totalSize = size * data.length;
        const x = handlerOffsetX.value % totalSize;

        if (!loop) {
            return handlerOffsetX.value;
        }
        return isNaN(x) ? 0 : x;
    }, [loop, size, data]);

    usePropsErrorBoundary(props);
    useOnProgressChange({ size, offsetX, data, onProgressChange });

    const carouselController = useCarouselController({
        loop,
        size,
        handlerOffsetX,
        length: data.length,
        disable: !data.length,
        originalLength: data.length,
        onScrollEnd: () => runOnJS(_onScrollEnd)(),
        onScrollBegin: () => !!onScrollBegin && runOnJS(onScrollBegin)(),
        onChange: (i) => onSnapToItem && runOnJS(onSnapToItem)(i),
    });

    const {
        next,
        prev,
        sharedPreIndex,
        sharedIndex,
        computedIndex,
        getCurrentIndex,
    } = carouselController;

    const { run, pause } = useAutoPlay({
        autoPlay,
        autoPlayInterval,
        autoPlayReverse,
        carouselController,
    });

    const scrollViewGestureOnScrollBegin = React.useCallback(() => {
        pause();
        onScrollBegin?.();
    }, [onScrollBegin, pause]);

    const _onScrollEnd = React.useCallback(() => {
        computedIndex();
        onScrollEnd?.(sharedPreIndex.current, sharedIndex.current);
    }, [sharedPreIndex, sharedIndex, computedIndex, onScrollEnd]);

    const scrollViewGestureOnScrollEnd = React.useCallback(() => {
        run();
        _onScrollEnd();
    }, [_onScrollEnd, run]);

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
        }),
        [getCurrentIndex, goToIndex, next, prev]
    );

    const visibleRanges = useVisibleRanges({
        total: data.length,
        viewSize: size,
        translation: handlerOffsetX,
        windowSize,
    });

    const layoutConfig = useLayoutConfig<T>({ ...props, size });

    const renderLayout = React.useCallback(
        (item: T, i: number) => {
            let realIndex = i;
            if (data.length === DATA_LENGTH.SINGLE_ITEM) {
                realIndex = i % 1;
            }

            if (data.length === DATA_LENGTH.DOUBLE_ITEM) {
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
            data,
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

export default React.forwardRef(Carousel) as typeof Carousel;

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
