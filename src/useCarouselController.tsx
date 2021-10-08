import React from 'react';
import type Animated from 'react-native-reanimated';
import { runOnJS, withTiming } from 'react-native-reanimated';
import type { IIndexController } from './useIndexController';
import type { ILockController } from './useLock';

interface IOpts {
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
    lockController: ILockController;
    indexController: IIndexController;
    timingConfig: Animated.WithTimingConfig;
    disable?: boolean;
    onPrev?: (isFinished: boolean) => void;
    onNext?: (isFinished: boolean) => void;
}

export interface ICarouselController {
    prev: () => void;
    next: () => void;
    to: (index: number, animated?: boolean) => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const {
        width,
        handlerOffsetX,
        timingConfig,
        lockController,
        indexController,
        disable = false,
        onPrev,
        onNext,
    } = opts;

    const canSliding = React.useCallback(() => {
        return !disable && !lockController.isLock();
    }, [lockController, disable]);

    const closeLock = React.useCallback(
        (isFinished: boolean) => {
            if (isFinished) {
                lockController.unLock();
            }
        },
        [lockController]
    );

    const next = React.useCallback(() => {
        if (!canSliding()) return;
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
        closeLock,
        canSliding,
        width,
        timingConfig,
        handlerOffsetX,
        lockController,
    ]);

    const prev = React.useCallback(() => {
        if (!canSliding()) return;

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
        closeLock,
        canSliding,
        width,
        timingConfig,
        handlerOffsetX,
        lockController,
    ]);

    const to = React.useCallback(
        (index: number, animated: boolean = false) => {
            if (index === indexController.index.value) return;
            if (!canSliding()) return;

            lockController.lock();

            const offset =
                handlerOffsetX.value +
                (indexController.index.value - index) * width;

            if (animated) {
                handlerOffsetX.value = withTiming(
                    offset,
                    timingConfig,
                    (isFinished: boolean) => {
                        indexController.index.value = index;
                        runOnJS(closeLock)(isFinished);
                    }
                );
            } else {
                handlerOffsetX.value = offset;
                indexController.index.value = index;
                runOnJS(closeLock)(true);
            }
        },
        [
            canSliding,
            closeLock,
            width,
            timingConfig,
            indexController,
            lockController,
            handlerOffsetX,
        ]
    );

    return {
        next,
        prev,
        to,
    };
}
