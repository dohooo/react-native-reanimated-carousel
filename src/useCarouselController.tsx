import React from 'react';
import type Animated from 'react-native-reanimated';
import { runOnJS, withTiming } from 'react-native-reanimated';
import type { IIndexController } from './useIndexController';
import type { ILockController } from './useLock';

interface IOpts {
    loop: boolean;
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
    lockController: ILockController;
    indexController: IIndexController;
    timingConfig: Animated.WithTimingConfig;
    disable?: boolean;
    onScrollBegin?: () => void;
    onScrollEnd?: () => void;
}

export interface ICarouselController {
    prev: () => void;
    next: () => void;
    to: (index: number, animated?: boolean) => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const {
        width,
        loop,
        handlerOffsetX,
        timingConfig,
        lockController,
        indexController,
        disable = false,
    } = opts;

    const canSliding = React.useCallback(() => {
        return !disable && !lockController.isLock();
    }, [lockController, disable]);

    const onScrollEnd = React.useCallback(() => {
        lockController.unLock();
        opts.onScrollEnd?.();
    }, [lockController, opts]);

    const onScrollBegin = React.useCallback(() => {
        opts.onScrollBegin?.();
        lockController.lock();
    }, [lockController, opts]);

    const next = React.useCallback(() => {
        if (
            !canSliding() ||
            (!loop &&
                indexController.index.value === indexController.length - 1)
        )
            return;

        onScrollBegin?.();

        handlerOffsetX.value = withTiming(
            handlerOffsetX.value - width,
            timingConfig,
            (isFinished: boolean) => {
                if (isFinished) {
                    runOnJS(onScrollEnd)();
                }
            }
        );
    }, [
        onScrollEnd,
        canSliding,
        onScrollBegin,
        width,
        timingConfig,
        handlerOffsetX,
        indexController,
        loop,
    ]);

    const prev = React.useCallback(() => {
        if (!canSliding() || (!loop && indexController.index.value === 0))
            return;

        onScrollBegin?.();

        handlerOffsetX.value = withTiming(
            handlerOffsetX.value + width,
            timingConfig,
            (isFinished: boolean) => {
                if (isFinished) {
                    runOnJS(onScrollEnd)();
                }
            }
        );
    }, [
        onScrollEnd,
        canSliding,
        onScrollBegin,
        width,
        timingConfig,
        handlerOffsetX,
        indexController,
        loop,
    ]);

    const to = React.useCallback(
        (index: number, animated: boolean = false) => {
            if (index === indexController.index.value) return;
            if (!canSliding()) return;

            onScrollBegin?.();

            const offset =
                handlerOffsetX.value +
                (indexController.index.value - index) * width;

            if (animated) {
                handlerOffsetX.value = withTiming(
                    offset,
                    timingConfig,
                    (isFinished: boolean) => {
                        indexController.index.value = index;
                        if (isFinished) {
                            runOnJS(onScrollEnd)();
                        }
                    }
                );
            } else {
                handlerOffsetX.value = offset;
                indexController.index.value = index;
                runOnJS(onScrollEnd)();
            }
        },
        [
            canSliding,
            onScrollBegin,
            onScrollEnd,
            width,
            timingConfig,
            indexController,
            handlerOffsetX,
        ]
    );

    return {
        next,
        prev,
        to,
    };
}
