import React from 'react';
import { timingConfig } from './Carousel';
import type Animated from 'react-native-reanimated';
import { useSharedValue, withTiming } from 'react-native-reanimated';

interface IOpts {
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
    disable?: boolean;
}

export interface ICarouselController {
    prev: (callback?: (isFinished: boolean) => void) => void;
    next: (callback?: (isFinished: boolean) => void) => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const lock = useSharedValue<boolean>(false);
    const { width, handlerOffsetX, disable = false } = opts;

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

    const next = React.useCallback(
        (callback?: (isFinished: boolean) => void) => {
            if (disable) return;
            if (lock.value) return;
            openLock();
            handlerOffsetX.value = withTiming(
                handlerOffsetX.value - width,
                timingConfig,
                (isFinished: boolean) => {
                    callback?.(isFinished);
                    closeLock(isFinished);
                }
            );
        },
        [width, openLock, closeLock, lock, handlerOffsetX, disable]
    );

    const prev = React.useCallback(
        (callback?: (isFinished: boolean) => void) => {
            if (disable) return;
            if (lock.value) return;
            openLock();
            handlerOffsetX.value = withTiming(
                handlerOffsetX.value + width,
                timingConfig,
                (isFinished: boolean) => {
                    callback?.(isFinished);
                    closeLock(isFinished);
                }
            );
        },
        [width, openLock, closeLock, lock, handlerOffsetX, disable]
    );

    return {
        next,
        prev,
    };
}
