import React, { PropsWithChildren } from 'react';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated';
import { ParallaxLayout, StackLayout, NormalLayout } from './layouts/index';
import { useCarouselController } from './hooks/useCarouselController';
import { useAutoPlay } from './hooks/useAutoPlay';
import { useIndexController } from './hooks/useIndexController';
import { usePropsErrorBoundary } from './hooks/usePropsErrorBoundary';
import { ScrollViewGesture } from './ScrollViewGesture';
import { useVisibleRanges } from './hooks/useVisibleRanges';
import type { ICarouselInstance, TCarouselProps } from './types';
import { StyleSheet, View } from 'react-native';
import type { StackAnimationConfig } from './layouts/StackLayout';
import { DATA_LENGTH } from './constants';

function Carousel<T>(
    props: PropsWithChildren<TCarouselProps<T>>,
    ref: React.Ref<ICarouselInstance>
) {
    const {
        defaultIndex = 0,
        data: _data = [],
        loop = true,
        mode = 'default',
        autoPlay,
        autoPlayReverse,
        autoPlayInterval = 1000,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        style = {},
        panGestureHandlerProps = {},
        windowSize,
        renderItem,
        onScrollEnd,
        onSnapToItem,
        onScrollBegin,
        onProgressChange,
        vertical = false,
        pagingEnabled = true,
        enableSnap = true,
        slidingSpeed = 100
    } = props;

    let animationConfig: StackAnimationConfig | undefined;
    let showLength: number | undefined;

    if (props.mode === 'stack') {
        animationConfig = props.animationConfig;
        showLength = props.showLength;
    }

    // @ts-ignore
    usePropsErrorBoundary({
        ...props,
        data: _data,
        mode,
        loop,
        style,
        vertical,
        defaultIndex,
        autoPlayInterval,
        panGestureHandlerProps,
    });

    const width = Math.round(props.width || 0);
    const height = Math.round(props.height || 0);
    const size = (vertical ? height : width) as number;
    const layoutStyle = { width: width || '100%', height: height || '100%' };
    const defaultHandlerOffsetX = -Math.abs(defaultIndex * size);
    const handlerOffsetX = useSharedValue<number>(defaultHandlerOffsetX);

    React.useEffect(() => {
        handlerOffsetX.value = defaultHandlerOffsetX;
    }, [vertical, handlerOffsetX, defaultHandlerOffsetX, loop]);

    const data = React.useMemo<T[]>(() => {
        if (!loop) return _data;

        if (_data.length === DATA_LENGTH.SINGLE_ITEM) {
            return [_data[0], _data[0], _data[0]];
        }

        if (_data.length === DATA_LENGTH.DOUBLE_ITEM) {
            return [_data[0], _data[1], _data[0], _data[1]];
        }

        return _data;
    }, [_data, loop]);

    const indexController = useIndexController({
        originalLength: data.length,
        length: data.length,
        handlerOffsetX,
        size,
        loop,
        onChange: (i) => onSnapToItem && runOnJS(onSnapToItem)(i),
    });

    const carouselController = useCarouselController({
        loop,
        size,
        handlerOffsetX,
        indexController,
        disable: !data.length,
        onScrollBegin: () => runOnJS(_onScrollBegin)(),
        onScrollEnd: () => runOnJS(_onScrollEnd)(),
        slidingSpeed,
    });

    const { run, pause } = useAutoPlay({
        autoPlay,
        autoPlayInterval,
        autoPlayReverse,
        carouselController,
    });

    const { index, sharedPreIndex, sharedIndex, computedIndex } =
        indexController;

    const _onScrollBegin = React.useCallback(() => {
        onScrollBegin?.();
    }, [onScrollBegin]);

    const scrollViewGestureOnScrollBegin = React.useCallback(() => {
        pause();
        _onScrollBegin();
    }, [_onScrollBegin, pause]);

    const _onScrollEnd = React.useCallback(() => {
        computedIndex();
        onScrollEnd?.(sharedPreIndex.current, sharedIndex.current);
    }, [sharedPreIndex, sharedIndex, computedIndex, onScrollEnd]);

    const scrollViewGestureOnScrollEnd = React.useCallback(() => {
        run();
        _onScrollEnd();
    }, [_onScrollEnd, run]);

    const offsetX = useDerivedValue(() => {
        const totalSize = size * data.length;
        const x = handlerOffsetX.value % totalSize;

        if (!loop) {
            return handlerOffsetX.value;
        }
        return isNaN(x) ? 0 : x;
    }, [loop, size, data]);

    useAnimatedReaction(
        () => offsetX.value,
        (_value) => {
            let value = _value;

            if (_data.length === DATA_LENGTH.SINGLE_ITEM) {
                value = value % size;
            }

            if (_data.length === DATA_LENGTH.DOUBLE_ITEM) {
                value = value % (size * 2);
            }

            let absoluteProgress = Math.abs(value / size);

            if (value > 0) {
                absoluteProgress = data.length - absoluteProgress;
            }

            !!onProgressChange &&
                runOnJS(onProgressChange)(value, absoluteProgress);
        },
        [onProgressChange, _data]
    );

    const next = React.useCallback(() => {
        return carouselController.next();
    }, [carouselController]);

    const prev = React.useCallback(() => {
        return carouselController.prev();
    }, [carouselController]);

    const getCurrentIndex = React.useCallback(() => {
        return index.value;
    }, [index]);

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

    const renderLayout = React.useCallback(
        (item: T, i: number) => {
            let realIndex = i;
            if (_data.length === DATA_LENGTH.SINGLE_ITEM) {
                realIndex = i % 1;
            }

            if (_data.length === DATA_LENGTH.DOUBLE_ITEM) {
                realIndex = i % 2;
            }

            switch (mode) {
                case 'parallax':
                    return (
                        <ParallaxLayout
                            data={data}
                            width={width}
                            height={height}
                            vertical={vertical}
                            parallaxScrollingOffset={parallaxScrollingOffset}
                            parallaxScrollingScale={parallaxScrollingScale}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                            visibleRanges={visibleRanges}
                        >
                            {renderItem(item, realIndex)}
                        </ParallaxLayout>
                    );
                case 'stack':
                    return (
                        <StackLayout
                            data={data}
                            width={width}
                            height={height}
                            vertical={vertical}
                            showLength={showLength}
                            animationConfig={animationConfig}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                            visibleRanges={visibleRanges}
                        >
                            {renderItem(item, realIndex)}
                        </StackLayout>
                    );
                case 'default':
                default:
                    return (
                        <NormalLayout
                            data={data}
                            width={width}
                            height={height}
                            vertical={vertical}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                            visibleRanges={visibleRanges}
                        >
                            {renderItem(item, realIndex)}
                        </NormalLayout>
                    );
            }
        },
        [
            loop,
            data,
            mode,
            width,
            _data,
            height,
            offsetX,
            vertical,
            showLength,
            renderItem,
            visibleRanges,
            animationConfig,
            parallaxScrollingScale,
            parallaxScrollingOffset,
        ]
    );

    return (
        <View style={[styles.container, layoutStyle, style]}>
            <ScrollViewGesture
                size={size}
                style={style}
                infinite={loop}
                vertical={mode !== 'stack' && vertical}
                maxPage={data.length}
                enableSnap={enableSnap}
                translation={handlerOffsetX}
                pagingEnabled={pagingEnabled}
                panGestureHandlerProps={panGestureHandlerProps}
                onScrollBegin={scrollViewGestureOnScrollBegin}
                onScrollEnd={scrollViewGestureOnScrollEnd}
                slidingSpeed={slidingSpeed}
            >
                <Animated.View
                    style={[
                        styles.container,
                        layoutStyle,
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
