import React from 'react';
import type Animated from 'react-native-reanimated';
import { runOnJS, withTiming } from 'react-native-reanimated';
import type { ILockController } from './useLock';

interface IOpts {
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
    lockController: ILockController;
    timingConfig: Animated.WithTimingConfig;
    disable?: boolean;
}

export interface ICarouselController {
    prev: (callback?: (isFinished: boolean) => void) => void;
    next: (callback?: (isFinished: boolean) => void) => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const {
        width,
        handlerOffsetX,
        timingConfig,
        lockController,
        disable = false,
    } = opts;

    const closeLock = React.useCallback(
        (isFinished: boolean) => {
            if (isFinished) {
                lockController.unLock();
            }
        },
        [lockController]
    );

    const next = React.useCallback(
        (callback?: (isFinished: boolean) => void) => {
            if (disable) return;
            if (lockController.isLock()) return;
            lockController.lock();
            handlerOffsetX.value = withTiming(
                handlerOffsetX.value - width,
                timingConfig,
                (isFinished: boolean) => {
                    !!callback && runOnJS(callback)(isFinished);
                    runOnJS(closeLock)(isFinished);
                }
            );
        },
        [
            width,
            lockController,
            timingConfig,
            closeLock,
            handlerOffsetX,
            disable,
        ]
    );

    const prev = React.useCallback(
        (callback?: (isFinished: boolean) => void) => {
            if (disable) return;
            if (lockController.isLock()) return;
            lockController.lock();
            handlerOffsetX.value = withTiming(
                handlerOffsetX.value + width,
                timingConfig,
                (isFinished: boolean) => {
                    !!callback && runOnJS(callback)(isFinished);
                    runOnJS(closeLock)(isFinished);
                }
            );
        },
        [
            width,
            lockController,
            timingConfig,
            closeLock,
            handlerOffsetX,
            disable,
        ]
    );

    return {
        next,
        prev,
    };
}
