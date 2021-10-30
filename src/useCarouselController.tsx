import React from 'react';
import type Animated from 'react-native-reanimated';
import { runOnJS, withTiming } from 'react-native-reanimated';
import type { IIndexController } from './useIndexController';

const defaultTimingConfig: Animated.WithTimingConfig = {
    duration: 250,
};

interface IOpts {
    loop: boolean;
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
    indexController: IIndexController;
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
        indexController,
        disable = false,
    } = opts;

    const canSliding = React.useCallback(() => {
        return !disable;
    }, [disable]);

    const onScrollEnd = React.useCallback(() => {
        opts.onScrollEnd?.();
    }, [opts]);

    const onScrollBegin = React.useCallback(() => {
        opts.onScrollBegin?.();
    }, [opts]);

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
            defaultTimingConfig,
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
            defaultTimingConfig,
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
                    defaultTimingConfig,
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
