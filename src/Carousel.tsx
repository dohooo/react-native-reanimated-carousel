import React from 'react';
import type { FlexStyle, ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerProps,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { CarouselItem } from './CarouselItem';
import type { TMode } from './layouts';
import { ParallaxLayout } from './layouts/index';
import { useCarouselController } from './hooks/useCarouselController';
import { useAutoPlay } from './hooks/useAutoPlay';
import { useIndexController } from './hooks/useIndexController';
import { usePropsErrorBoundary } from './hooks/usePropsErrorBoundary';
import { useVisibleRanges } from './hooks/useVisibleRanges';

const defaultSpringConfig: Animated.WithSpringConfig = {
    damping: 100,
};
export interface ICarouselProps<T extends unknown> {
    ref?: React.Ref<ICarouselInstance>;
    /**
     * Carousel loop playback.
     * @default true
     */
    loop?: boolean;
    /**
     * Carousel Animated transitions.
     * @default 'default'
     */
    mode?: TMode;
    /**
     * Specified carousel container width.
     */
    width: number;
    /**
     * Specified carousel container height.
     * @default '100%'
     */
    height?: FlexStyle['height'];
    /**
     * Carousel items data set.
     */
    data: T[];
    /**
     * Default index
     * @default 0
     */
    defaultIndex?: number;
    /**
     * Auto play
     */
    autoPlay?: boolean;
    /**
     * Auto play
     * @description reverse playback
     */
    autoPlayReverse?: boolean;
    /**
     * Auto play
     * @description playback interval
     */
    autoPlayInterval?: number;
    /**
     * Carousel container style
     */
    style?: ViewStyle;
    /**
     * When use 'default' Layout props,this prop can be control prev/next item offset.
     * @default 100
     */
    parallaxScrollingOffset?: number;
    /**
     * When use 'default' Layout props,this prop can be control prev/next item offset.
     * @default 0.8
     */
    parallaxScrollingScale?: number;
    /**
     * Sping config of translation animated
     */
    springConfig?: Animated.WithSpringConfig;
    /**
     * PanGestureHandler props
     */
    panGestureHandlerProps?: Omit<
        Partial<PanGestureHandlerProps>,
        'onHandlerStateChange'
    >;
    /**
     * Render carousel item.
     */
    renderItem: (data: T, index: number) => React.ReactNode;
    /**
     * Callback fired when navigating to an item
     */
    onSnapToItem?: (index: number) => void;
    /**
     * On scroll begin
     */
    onScrollBegin?: () => void;
    /**
     * On scroll end
     */
    onScrollEnd?: (previous: number, current: number) => void;
    /**
     * On progress change
     * @param offsetProgress Total of offset distance (0 390 780 ...)
     * @param absoluteProgress Convert to index (0 1 2 ...)
     */
    onProgressChange?: (
        offsetProgress: number,
        absoluteProgress: number
    ) => void;
}

export interface ICarouselInstance {
    /**
     * Play the last one
     */
    prev: () => void;
    /**
     * Play the next one
     */
    next: () => void;
    /**
     * Get current item index
     */
    getCurrentIndex: () => number;
    /**
     * Go to index
     */
    goToIndex: (index: number, animated?: boolean) => void;
}

function Carousel<T extends unknown = any>(
    props: ICarouselProps<T>,
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
    } = props;

    usePropsErrorBoundary({
        ...props,
        defaultIndex,
        height,
        data: _data,
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
        renderItem,
        onSnapToItem,
        onProgressChange,
    });

    const timingConfig = {
        ...defaultSpringConfig,
        ...props.springConfig,
    };
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
        originalLength: _data.length,
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
        disable: !data.length,
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
        [onProgressChange, data]
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

    const animatedListScrollHandler =
        useAnimatedGestureHandler<PanGestureHandlerGestureEvent>(
            {
                onStart: (_, ctx: any) => {
                    runOnJS(pause)();
                    runOnJS(onScrollBegin)();
                    cancelAnimation(handlerOffsetX);
                    ctx.currentContentOffsetX = handlerOffsetX.value;
                    ctx.start = true;
                },
                onActive: (e, ctx: any) => {
                    const { translationX } = e;
                    if (
                        !loop &&
                        (handlerOffsetX.value >= 0 ||
                            handlerOffsetX.value <= -(data.length - 1) * width)
                    ) {
                        handlerOffsetX.value =
                            ctx.currentContentOffsetX + translationX / 2;
                        return;
                    }
                    handlerOffsetX.value =
                        ctx.currentContentOffsetX + translationX;
                },
                onEnd: (e) => {
                    function _withAnimationCallback(num: number) {
                        return withSpring(
                            num,
                            Object.assign({}, timingConfig, {
                                velocity: e.velocityX,
                            }),
                            (isFinished) => {
                                if (isFinished) {
                                    runOnJS(onScrollEnd)();
                                }
                            }
                        );
                    }

                    const page = Math.round(handlerOffsetX.value / width);

                    const velocityPage = Math.round(
                        (handlerOffsetX.value + e.velocityX) / width
                    );

                    let pageWithVelocity = Math.min(
                        page + 1,
                        Math.max(page - 1, velocityPage)
                    );

                    if (!loop) {
                        pageWithVelocity = Math.max(
                            -(data.length - 1),
                            Math.min(0, pageWithVelocity)
                        );
                    }

                    if (loop) {
                        handlerOffsetX.value = _withAnimationCallback(
                            pageWithVelocity * width
                        );
                        return;
                    }
                    if (handlerOffsetX.value >= 0) {
                        handlerOffsetX.value = _withAnimationCallback(0);
                        return;
                    }

                    if (handlerOffsetX.value <= -(data.length - 1) * width) {
                        handlerOffsetX.value = _withAnimationCallback(
                            -(data.length - 1) * width
                        );
                        return;
                    }

                    handlerOffsetX.value = _withAnimationCallback(
                        pageWithVelocity * width
                    );
                },
            },
            [loop, data, onScrollBegin, onScrollEnd]
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
        <PanGestureHandler
            {...panGestureHandlerProps}
            onGestureEvent={animatedListScrollHandler}
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
        </PanGestureHandler>
    );
}

export default React.forwardRef(Carousel) as typeof Carousel;
