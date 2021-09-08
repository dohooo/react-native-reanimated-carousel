import React from 'react';
import type { FlexStyle, ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { CarouselItem } from './CarouselItem';
import { fillNum } from './fillNum';
import type { TMode } from './layouts';
import { ParallaxLayout } from './layouts/index';
import { useCarouselController } from './useCarouselController';
import { useComputedAnim } from './useComputedAnim';

export const _withTiming = (
    num: number,
    callback?: (isFinished: boolean) => void
) => {
    'worklet';
    return withTiming(
        num,
        {
            duration: 250,
        },
        (isFinished) => {
            !!callback && runOnJS(callback)(isFinished);
        }
    );
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
     * Render carousel item.
     */
    renderItem: (data: T, index: number) => React.ReactNode;
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
}

export interface ICarouselInstance {
    prev: () => void;
    next: () => void;
}

function Carousel<T extends unknown = any>(
    props: ICarouselProps<T>,
    ref: React.Ref<ICarouselInstance>
) {
    const {
        height = '100%',
        data: _data = [],
        width,
        loop = true,
        mode = 'default',
        renderItem,
        autoPlay = false,
        autoPlayReverse = false,
        autoPlayInterval = 1000,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        style,
    } = props;
    const handlerOffsetX = useSharedValue<number>(0);
    const timer = React.useRef<NodeJS.Timer>();
    const data = React.useMemo<T[]>(() => {
        if (_data.length === 1) {
            return [_data[0], _data[0], _data[0]];
        }
        if (_data.length === 2) {
            return [_data[0], _data[1], _data[0], _data[1]];
        }
        return _data;
    }, [_data]);

    const computedAnimResult = useComputedAnim(width, data.length);

    const { next, prev } = useCarouselController({ width, handlerOffsetX });

    const offsetX = useDerivedValue(() => {
        const x = handlerOffsetX.value % computedAnimResult.WL;
        return isNaN(x) ? 0 : x;
    }, []);

    const animatedListScrollHandler =
        useAnimatedGestureHandler<PanGestureHandlerGestureEvent>(
            {
                onStart: (_, ctx: any) => {
                    ctx.startContentOffsetX = handlerOffsetX.value;
                },
                onActive: (e, ctx: any) => {
                    if (loop) {
                        handlerOffsetX.value =
                            ctx.startContentOffsetX +
                            Math.round(e.translationX);
                        return;
                    }
                    handlerOffsetX.value = Math.max(
                        Math.min(
                            ctx.startContentOffsetX +
                                Math.round(e.translationX),
                            0
                        ),
                        -(data.length - 1) * width
                    );
                },
                onEnd: (e) => {
                    const intTranslationX = Math.round(e.translationX);
                    const sub = Math.abs(intTranslationX);

                    if (intTranslationX > 0) {
                        if (!loop && handlerOffsetX.value >= 0) {
                            return;
                        }

                        if (sub > width / 2) {
                            handlerOffsetX.value = _withTiming(
                                fillNum(
                                    width,
                                    handlerOffsetX.value + (width - sub)
                                )
                            );
                        } else {
                            handlerOffsetX.value = _withTiming(
                                fillNum(width, handlerOffsetX.value - sub)
                            );
                        }
                        return;
                    }

                    if (intTranslationX < 0) {
                        if (
                            !loop &&
                            handlerOffsetX.value <= -(data.length - 1) * width
                        ) {
                            return;
                        }

                        if (sub > width / 2) {
                            handlerOffsetX.value = _withTiming(
                                fillNum(
                                    width,
                                    handlerOffsetX.value - (width - sub)
                                )
                            );
                        } else {
                            handlerOffsetX.value = _withTiming(
                                fillNum(width, handlerOffsetX.value + sub)
                            );
                        }
                        return;
                    }
                },
            },
            [loop]
        );

    React.useImperativeHandle(ref, () => {
        return {
            next,
            prev,
        };
    });

    React.useEffect(() => {
        if (timer.current) {
            clearInterval(timer.current);
        }
        if (autoPlay) {
            timer.current = setInterval(() => {
                autoPlayReverse ? prev() : next();
            }, autoPlayInterval);
        }
        return () => {
            !!timer.current && clearInterval(timer.current);
        };
    }, [autoPlay, autoPlayReverse, autoPlayInterval, prev, next]);

    const Layouts = React.useMemo<React.FC<{ index: number }>>(() => {
        switch (mode) {
            case 'parallax':
                return ({ index, children }) => (
                    <ParallaxLayout
                        parallaxScrollingOffset={parallaxScrollingOffset}
                        parallaxScrollingScale={parallaxScrollingScale}
                        computedAnimResult={computedAnimResult}
                        width={width}
                        handlerOffsetX={offsetX}
                        index={index}
                        key={index}
                        loop={loop}
                    >
                        {children}
                    </ParallaxLayout>
                );
            default:
                return ({ index, children }) => (
                    <CarouselItem
                        computedAnimResult={computedAnimResult}
                        width={width}
                        height={height}
                        handlerOffsetX={offsetX}
                        index={index}
                        key={index}
                        loop={loop}
                    >
                        {children}
                    </CarouselItem>
                );
        }
    }, [
        loop,
        mode,
        computedAnimResult,
        height,
        offsetX,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        width,
    ]);

    return (
        <PanGestureHandler onHandlerStateChange={animatedListScrollHandler}>
            <Animated.View
                style={[
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                        width,
                        height,
                        flexDirection: 'row',
                        position: 'relative',
                    },
                    style,
                ]}
            >
                {data.map((item, index) => {
                    return (
                        <Layouts index={index} key={index}>
                            {renderItem(item, index)}
                        </Layouts>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default React.forwardRef(Carousel) as typeof Carousel;
