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
    onPrev?: (isFinished: boolean) => void;
    onNext?: (isFinished: boolean) => void;
}

export interface ICarouselController {
    prev: () => void;
    next: () => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const {
        width,
        handlerOffsetX,
        timingConfig,
        lockController,
        disable = false,
        onPrev,
        onNext,
    } = opts;

    const closeLock = React.useCallback(
        (isFinished: boolean) => {
            if (isFinished) {
                lockController.unLock();
            }
        },
        [lockController]
    );

    const next = React.useCallback(() => {
        if (disable) return;
        if (lockController.isLock()) return;
        lockController.lock();
        handlerOffsetX.value = withTiming(
            handlerOffsetX.value - width,
            timingConfig,
            (isFinished: boolean) => {
                !!onNext && runOnJS(onNext)(isFinished);
                runOnJS(closeLock)(isFinished);
            }
        );
    }, [
        onNext,
        width,
        lockController,
        timingConfig,
        closeLock,
        handlerOffsetX,
        disable,
    ]);

    const prev = React.useCallback(() => {
        if (disable) return;
        if (lockController.isLock()) return;
        lockController.lock();
        handlerOffsetX.value = withTiming(
            handlerOffsetX.value + width,
            timingConfig,
            (isFinished: boolean) => {
                !!onPrev && runOnJS(onPrev)(isFinished);
                runOnJS(closeLock)(isFinished);
            }
        );
    }, [
        onPrev,
        width,
        lockController,
        timingConfig,
        closeLock,
        handlerOffsetX,
        disable,
    ]);

    return {
        next,
        prev,
    };
}
