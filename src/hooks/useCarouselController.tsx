import React from 'react';
import type Animated from 'react-native-reanimated';
import { Easing } from '../constants';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

interface IOpts {
    loop: boolean;
    size: number;
    handlerOffsetX: Animated.SharedValue<number>;
    disable?: boolean;
    duration?: number;
    originalLength: number;
    length: number;
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
    prev: () => void;
    next: () => void;
    computedIndex: () => void;
    getCurrentIndex: () => number;
    to: (index: number, animated?: boolean) => void;
    scrollTo: (animationValue: number, animated?: boolean) => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const {
        size,
        loop,
        handlerOffsetX,
        disable = false,
        originalLength,
        length,
        onChange,
        duration,
    } = opts;

    const index = useSharedValue<number>(0);
    // The Index displayed to the user
    const sharedIndex = React.useRef<number>(0);
    const sharedPreIndex = React.useRef<number>(0);

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
        opts.onScrollEnd?.();
    }, [opts]);

    const onScrollBegin = React.useCallback(() => {
        opts.onScrollBegin?.();
    }, [opts]);

    const scrollWithTiming = React.useCallback(
        (toValue: number) => {
            return withTiming(
                toValue,
                { duration, easing: Easing.easeOutQuart },
                (isFinished: boolean) => {
                    if (isFinished) {
                        runOnJS(onScrollEnd)();
                    }
                }
            );
        },
        [onScrollEnd, duration]
    );

    const next = React.useCallback(
        (n = 1, animated = true) => {
            if (!canSliding() || (!loop && index.value >= length - 1)) return;

            onScrollBegin?.();

            const nextPage = currentFixedPage() + n;
            index.value = nextPage;
            handlerOffsetX.value = animated
                ? scrollWithTiming(-nextPage * size)
                : -nextPage * size;
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
        (n = 1, animated = true) => {
            if (!canSliding() || (!loop && index.value <= 0)) return;

            onScrollBegin?.();

            const prevPage = currentFixedPage() - n;
            index.value = prevPage;
            handlerOffsetX.value = animated
                ? scrollWithTiming(-prevPage * size)
                : -prevPage * size;
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
        (value: number, animated = true) => {
            const n = Math.round(value);
            if (n < 0) {
                prev(Math.abs(n), animated);
            } else {
                next(n, animated);
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
