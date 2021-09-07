import React from 'react';
import { _withTiming } from './Carousel';
import type Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';

interface IOpts {
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
}

export function useCarouselController(opts: IOpts) {
    const lock = useSharedValue<boolean>(false);
    const { width, handlerOffsetX } = opts;

    const closeLock = React.useCallback(
        (isFinished: boolean) => {
            if (isFinished) {
                lock.value = false;
            }
        },
        [lock]
    );
    const openLock = React.useCallback(() => {
        lock.value = true;
    }, [lock]);

    const next = React.useCallback(() => {
        if (lock.value) return;
        openLock();
        handlerOffsetX.value = _withTiming(
            handlerOffsetX.value - width,
            closeLock
        );
    }, [width, openLock, closeLock, lock, handlerOffsetX]);

    const prev = React.useCallback(() => {
        if (lock.value) return;
        openLock();
        handlerOffsetX.value = _withTiming(
            handlerOffsetX.value + width,
            closeLock
        );
    }, [width, openLock, closeLock, lock, handlerOffsetX]);

    return {
        next,
        prev,
    };
}
