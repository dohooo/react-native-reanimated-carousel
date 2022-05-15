import React from 'react';
import type Animated from 'react-native-reanimated';
import { Easing } from '../constants';
import {
    runOnJS,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated';
import type {
    TCarouselActionOptions,
    TCarouselProps,
    WithTimingAnimation,
} from '../types';
import { dealWithAnimation } from '@/utils/dealWithAnimation';
import { convertToSharedIndex } from '@/utils/computedWithAutoFillData';

interface IOpts {
    loop: boolean;
    size: number;
    data: TCarouselProps['data'];
    autoFillData: TCarouselProps['autoFillData'];
    handlerOffsetX: Animated.SharedValue<number>;
    withAnimation?: TCarouselProps['withAnimation'];
    duration?: number;
    defaultIndex?: number;
    onScrollBegin?: () => void;
    onScrollEnd?: () => void;
}

export interface ICarouselController {
    sharedIndex: Animated.SharedValue<number>;
    sharedPreIndex: Animated.SharedValue<number>;
    prev: (opts?: TCarouselActionOptions) => void;
    next: (opts?: TCarouselActionOptions) => void;
    getCurrentIndex: () => number;
    to: (index: number, animated?: boolean) => void;
    scrollTo: (opts?: TCarouselActionOptions) => void;
}

export function useCarouselController(options: IOpts): ICarouselController {
    const {
        size,
        data,
        loop,
        handlerOffsetX,
        withAnimation,
        defaultIndex = 0,
        duration,
        autoFillData,
    } = options;

    const dataInfo = React.useMemo(
        () => ({
            length: data.length,
            disable: !data.length,
            originalLength: data.length,
        }),
        [data]
    );

    const index = useSharedValue<number>(defaultIndex);
    // The Index displayed to the user
    const sharedIndex = useSharedValue<number>(defaultIndex);
    const sharedPreIndex = useSharedValue<number>(defaultIndex);

    const currentFixedPage = React.useCallback(() => {
        if (loop) {
            return -Math.round(handlerOffsetX.value / size);
        }

        const fixed = (handlerOffsetX.value / size) % dataInfo.length;
        return Math.round(
            handlerOffsetX.value <= 0
                ? Math.abs(fixed)
                : Math.abs(fixed > 0 ? dataInfo.length - fixed : 0)
        );
    }, [handlerOffsetX, dataInfo, size, loop]);

    useDerivedValue(() => {
        const handlerOffsetXValue = handlerOffsetX.value;
        sharedPreIndex.value = sharedIndex.value;
        const toInt = (handlerOffsetXValue / size) % dataInfo.length;
        const isPositive = handlerOffsetXValue <= 0;
        const i = isPositive
            ? Math.abs(toInt)
            : Math.abs(toInt > 0 ? dataInfo.length - toInt : 0);
        index.value = i;
        sharedIndex.value = convertToSharedIndex({
            loop,
            rawDataLength: dataInfo.originalLength,
            autoFillData: autoFillData!,
            index: i,
        });
    }, [
        sharedPreIndex,
        sharedIndex,
        size,
        dataInfo,
        index,
        loop,
        autoFillData,
        handlerOffsetX,
    ]);

    const getCurrentIndex = React.useCallback(() => {
        return index.value;
    }, [index]);

    const canSliding = React.useCallback(() => {
        return !dataInfo.disable;
    }, [dataInfo]);

    const onScrollEnd = React.useCallback(() => {
        options.onScrollEnd?.();
    }, [options]);

    const onScrollBegin = React.useCallback(() => {
        options.onScrollBegin?.();
    }, [options]);

    const scrollWithTiming = React.useCallback(
        (toValue: number, onFinished?: () => void) => {
            'worklet';
            const callback = (isFinished: boolean) => {
                'worklet';
                if (isFinished) {
                    runOnJS(onScrollEnd)();
                    onFinished && runOnJS(onFinished)();
                }
            };

            const defaultWithAnimation: WithTimingAnimation = {
                type: 'timing',
                config: { duration, easing: Easing.easeOutQuart },
            };

            return dealWithAnimation(withAnimation ?? defaultWithAnimation)(
                toValue,
                callback
            );
        },
        [duration, withAnimation, onScrollEnd]
    );

    const next = React.useCallback(
        (opts: TCarouselActionOptions = {}) => {
            'worklet';
            const { count = 1, animated = true, onFinished } = opts;
            if (!canSliding() || (!loop && index.value >= dataInfo.length - 1))
                return;

            onScrollBegin?.();

            const nextPage = currentFixedPage() + count;
            index.value = nextPage;

            if (animated) {
                handlerOffsetX.value = scrollWithTiming(
                    -nextPage * size,
                    onFinished
                ) as any;
            } else {
                handlerOffsetX.value = -nextPage * size;
                onFinished?.();
            }
        },
        [
            canSliding,
            loop,
            index,
            dataInfo,
            onScrollBegin,
            handlerOffsetX,
            size,
            scrollWithTiming,
            currentFixedPage,
        ]
    );

    const prev = React.useCallback(
        (opts: TCarouselActionOptions = {}) => {
            const { count = 1, animated = true, onFinished } = opts;
            if (!canSliding() || (!loop && index.value <= 0)) return;

            onScrollBegin?.();

            const prevPage = currentFixedPage() - count;
            index.value = prevPage;

            if (animated) {
                handlerOffsetX.value = scrollWithTiming(
                    -prevPage * size,
                    onFinished
                );
            } else {
                handlerOffsetX.value = -prevPage * size;
                onFinished?.();
            }
        },
        [
            canSliding,
            loop,
            index,
            onScrollBegin,
            handlerOffsetX,
            size,
            scrollWithTiming,
            currentFixedPage,
        ]
    );

    const to = React.useCallback(
        (idx: number, animated: boolean = false) => {
            if (idx === index.value) return;
            if (!canSliding()) return;

            onScrollBegin?.();

            const offset = handlerOffsetX.value + (index.value - idx) * size;

            if (animated) {
                index.value = idx;
                handlerOffsetX.value = scrollWithTiming(offset);
            } else {
                handlerOffsetX.value = offset;
                index.value = idx;
                runOnJS(onScrollEnd)();
            }
        },
        [
            index,
            canSliding,
            onScrollBegin,
            handlerOffsetX,
            size,
            scrollWithTiming,
            onScrollEnd,
        ]
    );

    const scrollTo = React.useCallback(
        (opts: TCarouselActionOptions = {}) => {
            const { count, animated = false, onFinished } = opts;
            if (!count) {
                return;
            }
            const n = Math.round(count);
            if (n < 0) {
                prev({ count: Math.abs(n), animated, onFinished });
            } else {
                next({ count: n, animated, onFinished });
            }
        },
        [prev, next]
    );

    return {
        sharedIndex,
        sharedPreIndex,
        to,
        next,
        prev,
        scrollTo,
        getCurrentIndex,
    };
}
