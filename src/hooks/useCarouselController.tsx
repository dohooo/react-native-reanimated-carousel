import React from 'react';
import type Animated from 'react-native-reanimated';
import { runOnJS, withSpring } from 'react-native-reanimated';
import type { IIndexController } from './useIndexController';

interface IOpts {
    loop: boolean;
    size: number;
    handlerOffsetX: Animated.SharedValue<number>;
    indexController: IIndexController;
    disable?: boolean;
    onScrollBegin?: () => void;
    onScrollEnd?: () => void;
    slidingSpeed: number;
}

export interface ICarouselController {
    prev: () => void;
    next: () => void;
    to: (index: number, animated?: boolean) => void;
}

export function useCarouselController(opts: IOpts): ICarouselController {
    const {
        size,
        loop,
        handlerOffsetX,
        indexController,
        disable = false,
        slidingSpeed,
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

    const scrollWithSpring = React.useCallback(
        (toValue: number, callback?: () => void) => {
            return withSpring(
                toValue,
                {
                    damping: 100,
                    stiffness: slidingSpeed,
                },
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
        if (
            !canSliding() ||
            (!loop &&
                indexController.index.value === indexController.length - 1)
        )
            return;

        onScrollBegin?.();

        const currentPage = Math.round(handlerOffsetX.value / size);

        handlerOffsetX.value = scrollWithSpring((currentPage - 1) * size);
    }, [
        canSliding,
        onScrollBegin,
        size,
        handlerOffsetX,
        indexController,
        loop,
        scrollWithSpring,
    ]);

    const prev = React.useCallback(() => {
        if (!canSliding() || (!loop && indexController.index.value === 0))
            return;

        onScrollBegin?.();

        const currentPage = Math.round(handlerOffsetX.value / size);

        handlerOffsetX.value = scrollWithSpring((currentPage + 1) * size);
    }, [
        canSliding,
        onScrollBegin,
        size,
        handlerOffsetX,
        indexController,
        loop,
        scrollWithSpring,
    ]);

    const to = React.useCallback(
        (index: number, animated: boolean = false) => {
            if (index === indexController.index.value) return;
            if (!canSliding()) return;

            onScrollBegin?.();

            const offset =
                handlerOffsetX.value +
                (indexController.index.value - index) * size;

            if (animated) {
                handlerOffsetX.value = scrollWithSpring(offset, () => {
                    indexController.index.value = index;
                });
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
            size,
            indexController,
            handlerOffsetX,
            scrollWithSpring,
        ]
    );

    return {
        next,
        prev,
        to,
    };
}
