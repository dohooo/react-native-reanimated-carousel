import React, { PropsWithChildren } from 'react';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated';
import { CarouselItem } from './CarouselItem';
import { ParallaxLayout } from './layouts/index';
import { useCarouselController } from './hooks/useCarouselController';
import { useAutoPlay } from './hooks/useAutoPlay';
import { useIndexController } from './hooks/useIndexController';
import { usePropsErrorBoundary } from './hooks/usePropsErrorBoundary';
import { ScrollViewGesture } from './ScrollViewGesture';
import { useVisibleRanges } from './hooks/useVisibleRanges';
import type { ICarouselInstance, ICarouselProps } from './types';

function Carousel<T>(
    props: PropsWithChildren<ICarouselProps<T>>,
    ref: React.Ref<ICarouselInstance>
) {
    const {
        defaultIndex = 0,
        height = '100%',
        data: _data = [],
        loop = true,
        mode = 'default',
        autoPlay,
        autoPlayReverse,
        autoPlayInterval = 1000,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        style,
        panGestureHandlerProps = {},
        renderItem,
        onSnapToItem,
        onProgressChange,
        windowSize,
    } = props;

    usePropsErrorBoundary({
        ...props,
        defaultIndex,
        height,
        loop,
        mode,
        autoPlay,
        autoPlayReverse,
        autoPlayInterval,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        style,
        panGestureHandlerProps,
        // @ts-ignore
        onSnapToItem,
        onProgressChange,
        viewCount: _data.length,
    });

    const width = Math.round(props.width);
    const defaultHandlerOffsetX = -Math.abs(defaultIndex * width);
    const handlerOffsetX = useSharedValue<number>(defaultHandlerOffsetX);
    const data = React.useMemo<T[]>(() => {
        if (!loop) return _data;

        if (_data.length === 1) {
            return [_data[0], _data[0], _data[0]];
        }

        if (_data.length === 2) {
            return [_data[0], _data[1], _data[0], _data[1]];
        }

        return _data;
    }, [_data, loop]);

    const indexController = useIndexController({
        originalLength: data.length,
        length: data.length,
        handlerOffsetX,
        width,
        loop,
        onChange: (i) => onSnapToItem && runOnJS(onSnapToItem)(i),
    });

    const carouselController = useCarouselController({
        loop,
        width,
        handlerOffsetX,
        indexController,
        disable: false,
        onScrollBegin: () => runOnJS(onScrollBegin)(),
        onScrollEnd: () => runOnJS(onScrollEnd)(),
    });

    const { run, pause } = useAutoPlay({
        autoPlay,
        autoPlayInterval,
        autoPlayReverse,
        carouselController,
    });

    const { index, sharedPreIndex, sharedIndex, computedIndex } =
        indexController;

    const onScrollBegin = React.useCallback(() => {
        pause();
        props.onScrollBegin?.();
    }, [pause, props]);

    const onScrollEnd = React.useCallback(() => {
        run();
        computedIndex();
        props.onScrollEnd?.(sharedPreIndex.current, sharedIndex.current);
    }, [sharedPreIndex, sharedIndex, computedIndex, props, run]);

    const offsetX = useDerivedValue(() => {
        const totalWidth = width * data.length;
        const x = handlerOffsetX.value % totalWidth;

        if (!loop) {
            return handlerOffsetX.value;
        }
        return isNaN(x) ? 0 : x;
    }, [loop, width, data]);

    useAnimatedReaction(
        () => offsetX.value,
        (value) => {
            let absoluteProgress = Math.abs(value / width);
            if (value > 0) {
                absoluteProgress = data.length - absoluteProgress;
            }
            !!onProgressChange &&
                runOnJS(onProgressChange)(value, absoluteProgress);
        },
        [onProgressChange, props.children]
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
        viewSize: width,
        translation: handlerOffsetX,
        windowSize,
    });

    const renderLayout = React.useCallback(
        (item: T, i: number) => {
            switch (mode) {
                case 'parallax':
                    return (
                        <ParallaxLayout
                            parallaxScrollingOffset={parallaxScrollingOffset}
                            parallaxScrollingScale={parallaxScrollingScale}
                            data={data}
                            width={width}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                            visibleRanges={visibleRanges}
                        >
                            {renderItem(item, i)}
                        </ParallaxLayout>
                    );
                default:
                    return (
                        <CarouselItem
                            data={data}
                            width={width}
                            height={height}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                            visibleRanges={visibleRanges}
                        >
                            {renderItem(item, i)}
                        </CarouselItem>
                    );
            }
        },
        [
            loop,
            mode,
            data,
            height,
            offsetX,
            parallaxScrollingOffset,
            parallaxScrollingScale,
            width,
            renderItem,
            visibleRanges,
        ]
    );

    return (
        <ScrollViewGesture
            pagingEnabled
            infinite={loop}
            translation={handlerOffsetX}
            style={style}
            totalWidth={data.length * width}
            width={width}
            count={data.length}
        >
            <Animated.View
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                    ...style,
                    width,
                    height,
                    flexDirection: 'row',
                    position: 'relative',
                }}
            >
                {data.map(renderLayout)}
            </Animated.View>
        </ScrollViewGesture>
    );
}

export default React.forwardRef(Carousel) as typeof Carousel;
