import React, { PropsWithChildren, ReactNode } from 'react';
import type { FlexStyle, ViewStyle } from 'react-native';
import type { PanGestureHandlerProps } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated';
import { CarouselItem } from './CarouselItem';
import type { TMode } from './layouts';
import { ParallaxLayout } from './layouts/index';
import { useCarouselController } from './hooks/useCarouselController';
import { useComputedAnim } from './hooks/useComputedAnim';
import { useAutoPlay } from './hooks/useAutoPlay';
import { useIndexController } from './hooks/useIndexController';
import { usePropsErrorBoundary } from './hooks/usePropsErrorBoundary';
import { ScrollViewGesture } from './ScrollViewGesture';

export interface ICarouselProps {
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
    // data?: T[];
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
    // renderItem?: (data: T, index: number) => React.ReactNode;
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

function Carousel(
    props: PropsWithChildren<ICarouselProps>,
    ref: React.Ref<ICarouselInstance>
) {
    const {
        defaultIndex = 0,
        height = '100%',
        loop = true,
        mode = 'default',
        autoPlay,
        autoPlayReverse,
        autoPlayInterval = 1000,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        style,
        panGestureHandlerProps = {},
        onSnapToItem,
        onProgressChange,
    } = props;

    const childrenCount = React.Children.count(props.children);

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
        viewCount: childrenCount,
    });

    const width = Math.round(props.width);
    const defaultHandlerOffsetX = -Math.abs(defaultIndex * width);
    const handlerOffsetX = useSharedValue<number>(defaultHandlerOffsetX);
    const childrens = React.useMemo<ReactNode[]>(() => {
        const arr = React.Children.toArray(props.children);
        if (!loop) return arr;

        if (arr.length === 1) {
            return [arr[0], arr[0], arr[0]];
        }

        if (arr.length === 2) {
            return [arr[0], arr[1], arr[0], arr[1]];
        }

        return arr;
    }, [props.children, loop]);

    const computedAnimResult = useComputedAnim(width, childrens.length);

    const indexController = useIndexController({
        originalLength: childrens.length,
        length: childrens.length,
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
        const x = handlerOffsetX.value % computedAnimResult.TOTAL_WIDTH;

        if (!loop) {
            return handlerOffsetX.value;
        }
        return isNaN(x) ? 0 : x;
    }, [computedAnimResult, loop]);

    useAnimatedReaction(
        () => offsetX.value,
        (value) => {
            let absoluteProgress = Math.abs(value / width);
            if (value > 0) {
                absoluteProgress = childrenCount - absoluteProgress;
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

    const renderLayout = React.useCallback(
        (children: ReactNode, i: number) => {
            switch (mode) {
                case 'parallax':
                    return (
                        <ParallaxLayout
                            parallaxScrollingOffset={parallaxScrollingOffset}
                            parallaxScrollingScale={parallaxScrollingScale}
                            computedAnimResult={computedAnimResult}
                            width={width}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                        >
                            {children}
                        </ParallaxLayout>
                    );
                default:
                    return (
                        <CarouselItem
                            computedAnimResult={computedAnimResult}
                            width={width}
                            height={height}
                            handlerOffsetX={offsetX}
                            index={i}
                            key={i}
                            loop={loop}
                        >
                            {children}
                        </CarouselItem>
                    );
            }
        },
        [
            loop,
            mode,
            computedAnimResult,
            height,
            offsetX,
            parallaxScrollingOffset,
            parallaxScrollingScale,
            width,
        ]
    );

    return (
        <ScrollViewGesture
            pagingEnabled
            horizontal
            infinite={loop}
            translation={handlerOffsetX}
            style={style}
            totalWidth={computedAnimResult.TOTAL_WIDTH}
            width={width}
            count={childrenCount}
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
                {childrens.map(renderLayout)}
            </Animated.View>
        </ScrollViewGesture>
    );
}

export default React.forwardRef(Carousel) as typeof Carousel;
