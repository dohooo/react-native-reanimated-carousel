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
        (toValue: number, callback?: () => void) => {
            return withTiming(
                toValue,
                { duration, easing: Easing.easeOutQuart },
                (isFinished: boolean) => {
                    callback?.();
                    if (isFinished) {
                        runOnJS(onScrollEnd)();
                    }
                }
            );
        },
        [onScrollEnd, duration]
    );

    const next = React.useCallback(() => {
        if (!canSliding() || (!loop && index.value === length - 1)) return;

        onScrollBegin?.();

        const currentPage = Math.round(handlerOffsetX.value / size);

        handlerOffsetX.value = scrollWithTiming((currentPage - 1) * size);
    }, [
        canSliding,
        loop,
        index.value,
        length,
        onScrollBegin,
        handlerOffsetX,
        size,
        scrollWithTiming,
    ]);

    const prev = React.useCallback(() => {
        if (!canSliding() || (!loop && index.value === 0)) return;

        onScrollBegin?.();

        const currentPage = Math.round(handlerOffsetX.value / size);

        handlerOffsetX.value = scrollWithTiming((currentPage + 1) * size);
    }, [
        canSliding,
        loop,
        index.value,
        onScrollBegin,
        handlerOffsetX,
        size,
        scrollWithTiming,
    ]);

    const to = React.useCallback(
        (idx: number, animated: boolean = false) => {
            if (idx === index.value) return;
            if (!canSliding()) return;

            onScrollBegin?.();

            const offset = handlerOffsetX.value + (index.value - idx) * size;

            if (animated) {
                handlerOffsetX.value = scrollWithTiming(offset, () => {
                    index.value = idx;
                });
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

    return {
        next,
        prev,
        to,
        index,
        length,
        sharedIndex,
        sharedPreIndex,
        computedIndex,
        getCurrentIndex,
    };
}
