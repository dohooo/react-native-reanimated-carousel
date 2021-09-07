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
import type { TLayout } from './layouts';
import { DefaultLayout } from './layouts/DefaultLayout';
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
     * Carousel Animated transitions.
     * @default 'default'
     */
    layout?: TLayout;
    /**
     * Press item callback.
     */
    onPressItem?: (data: any, index: number) => void;
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
        data,
        width,
        layout = 'default',
        renderItem,
        autoPlay = false,
        autoPlayReverse = false,
        autoPlayInterval = 1000,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        style,
    } = props;
    const { onPressItem } = props;
    const handlerOffsetX = useSharedValue<number>(0);
    const timer = React.useRef<NodeJS.Timer>();
    const computedAnimResult = useComputedAnim(width, data.length);
    const { next, prev } = useCarouselController({ width, handlerOffsetX });
    const offsetX = useDerivedValue(
        () => handlerOffsetX.value % computedAnimResult.WL,
        []
    );
    const animatedListScrollHandler =
        useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
            onStart: (_, ctx: any) => {
                ctx.startContentOffsetX = handlerOffsetX.value;
            },
            onActive: (e, ctx: any) => {
                handlerOffsetX.value =
                    ctx.startContentOffsetX + Math.round(e.translationX);
            },
            onEnd: (e) => {
                const intTranslationX = Math.round(e.translationX);
                const sub = Math.abs(intTranslationX);

                if (intTranslationX > 0) {
                    if (sub > width / 2) {
                        handlerOffsetX.value = _withTiming(
                            fillNum(width, handlerOffsetX.value + (width - sub))
                        );
                    } else {
                        handlerOffsetX.value = _withTiming(
                            fillNum(width, handlerOffsetX.value - sub)
                        );
                    }
                    return;
                }

                if (intTranslationX < 0) {
                    if (sub > width / 2) {
                        handlerOffsetX.value = _withTiming(
                            fillNum(width, handlerOffsetX.value - (width - sub))
                        );
                    } else {
                        handlerOffsetX.value = _withTiming(
                            fillNum(width, handlerOffsetX.value + sub)
                        );
                    }
                    return;
                }
            },
        });

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

    const Layouts = React.useMemo(() => {
        switch (layout) {
            case 'default':
            default:
                return DefaultLayout;
        }
    }, [layout]);

    return (
        <PanGestureHandler onHandlerStateChange={animatedListScrollHandler}>
            <Animated.View
                style={[
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                        width,
                        height,
                        flexDirection: 'row',
                    },
                    style,
                ]}
            >
                {data.map((item, index) => {
                    return (
                        <CarouselItem
                            computedAnimResult={computedAnimResult}
                            width={width}
                            height={height}
                            onPress={() => onPressItem?.(item, index)}
                            handlerOffsetX={offsetX}
                            index={index}
                            key={index}
                        >
                            {/* <View style={{ backgroundColor: "red", flex: 1 }} /> */}
                            <Layouts
                                parallaxScrollingOffset={
                                    parallaxScrollingOffset
                                }
                                parallaxScrollingScale={parallaxScrollingScale}
                                computedAnimResult={computedAnimResult}
                                width={width}
                                handlerOffsetX={offsetX}
                                index={index}
                            >
                                {renderItem(item, index)}
                            </Layouts>
                        </CarouselItem>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default React.forwardRef(Carousel) as typeof Carousel;
