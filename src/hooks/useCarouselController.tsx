import React from 'react';
import type Animated from 'react-native-reanimated';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

interface IOpts {
    loop: boolean;
    size: number;
    handlerOffsetX: Animated.SharedValue<number>;
    disable?: boolean;
    onScrollBegin?: () => void;
    onScrollEnd?: () => void;
    // the length before fill data
    originalLength: number;
    length: number;
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

    const scrollWithSpring = React.useCallback(
        (toValue: number, callback?: () => void) => {
            return withSpring(
                toValue,
                { damping: 100 },
                (isFinished: boolean) => {
                    callback?.();
                    if (isFinished) {
                        runOnJS(onScrollEnd)();
                    }
                }
            );
        },
        [onScrollEnd]
    );

    const next = React.useCallback(() => {
        if (!canSliding() || (!loop && index.value === length - 1)) return;

        onScrollBegin?.();

        const currentPage = Math.round(handlerOffsetX.value / size);

        handlerOffsetX.value = scrollWithSpring((currentPage - 1) * size);
    }, [
        canSliding,
        loop,
        index.value,
        length,
        onScrollBegin,
        handlerOffsetX,
        size,
        scrollWithSpring,
    ]);

    const prev = React.useCallback(() => {
        if (!canSliding() || (!loop && index.value === 0)) return;

        onScrollBegin?.();

        const currentPage = Math.round(handlerOffsetX.value / size);

        handlerOffsetX.value = scrollWithSpring((currentPage + 1) * size);
    }, [
        canSliding,
        loop,
        index.value,
        onScrollBegin,
        handlerOffsetX,
        size,
        scrollWithSpring,
    ]);

    const to = React.useCallback(
        (idx: number, animated: boolean = false) => {
            if (idx === index.value) return;
            if (!canSliding()) return;

            onScrollBegin?.();

            const offset = handlerOffsetX.value + (index.value - idx) * size;

            if (animated) {
                handlerOffsetX.value = scrollWithSpring(offset, () => {
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
            scrollWithSpring,
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
