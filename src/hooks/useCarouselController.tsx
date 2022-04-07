import React from 'react';
import type Animated from 'react-native-reanimated';
import { Easing } from '../constants';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import type {
    TCarouselActionOptions,
    TCarouselProps,
    WithTimingAnimation,
} from '../types';
import { dealWithAnimation } from '@/utils/dealWithAnimation';

interface IOpts {
    loop: boolean;
    size: number;
    handlerOffsetX: Animated.SharedValue<number>;
    withAnimation?: TCarouselProps['withAnimation'];
    disable?: boolean;
    duration?: number;
    originalLength: number;
    length: number;
    defaultIndex?: number;
    onScrollBegin?: () => void;
    onScrollEnd?: () => void;
    // the length before fill data
    onChange: (index: number) => void;
}

export interface ICarouselController {
    length: number;
    index: Animated.SharedValue<number>;
    sharedIndex: React.MutableRefObject<number>;
    sharedPreIndex: React.MutableRefObject<number>;
    prev: (opts?: TCarouselActionOptions) => void;
    next: (opts?: TCarouselActionOptions) => void;
    computedIndex: () => void;
    getCurrentIndex: () => number;
    to: (index: number, animated?: boolean) => void;
    scrollTo: (opts?: TCarouselActionOptions) => void;
}

export function useCarouselController(options: IOpts): ICarouselController {
    const {
        size,
        loop,
        handlerOffsetX,
        withAnimation,
        disable = false,
        originalLength,
        length,
        onChange,
        duration,
        defaultIndex = 0,
    } = options;

    const index = useSharedValue<number>(defaultIndex);
    // The Index displayed to the user
    const sharedIndex = React.useRef<number>(defaultIndex);
    const sharedPreIndex = React.useRef<number>(defaultIndex);

    const currentFixedPage = React.useCallback(() => {
        if (loop) {
            return -Math.round(handlerOffsetX.value / size);
        }

        const fixed = (handlerOffsetX.value / size) % length;
        return Math.round(
            handlerOffsetX.value <= 0
                ? Math.abs(fixed)
                : Math.abs(fixed > 0 ? length - fixed : 0)
        );
    }, [handlerOffsetX, length, size, loop]);

    const convertToSharedIndex = React.useCallback(
        (i: number) => {
            if (loop) {
                switch (originalLength) {
                    case 1:
                        return 0;
                    case 2:
                        return i % 2;
                }
            }
            return i;
        },
        [originalLength, loop]
    );

    const computedIndex = React.useCallback(() => {
        sharedPreIndex.current = sharedIndex.current;
        const toInt = (handlerOffsetX.value / size) % length;
        const i =
            handlerOffsetX.value <= 0
                ? Math.abs(toInt)
                : Math.abs(toInt > 0 ? length - toInt : 0);
        index.value = i;
        const _sharedIndex = convertToSharedIndex(i);
        sharedIndex.current = _sharedIndex;
        onChange(_sharedIndex);
    }, [
        length,
        handlerOffsetX,
        sharedPreIndex,
        index,
        size,
        sharedIndex,
        convertToSharedIndex,
        onChange,
    ]);

    const getCurrentIndex = React.useCallback(() => {
        return index.value;
    }, [index]);

    const canSliding = React.useCallback(() => {
        return !disable;
    }, [disable]);

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
            if (!canSliding() || (!loop && index.value >= length - 1)) return;

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
            length,
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
        next,
        prev,
        to,
        scrollTo,
        index,
        length,
        sharedIndex,
        sharedPreIndex,
        computedIndex,
        getCurrentIndex,
    };
}
