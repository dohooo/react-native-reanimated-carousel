import * as React from 'react';
import type { ICarouselController } from './useCarouselController';

export function useAutoPlay(opts: {
    autoPlay?: boolean;
    autoPlayInterval?: number;
    autoPlayReverse?: boolean;
    carouselController: ICarouselController;
}) {
    const {
        autoPlay = false,
        autoPlayReverse = false,
        autoPlayInterval,
        carouselController,
    } = opts;

    const timer = React.useRef<NodeJS.Timer>();

    const run = React.useCallback(() => {
        if (autoPlay) {
            timer.current = setInterval(() => {
                autoPlayReverse
                    ? carouselController.prev()
                    : carouselController.next();
            }, autoPlayInterval);
        }
    }, [autoPlay, autoPlayReverse, carouselController, autoPlayInterval]);

    const pause = React.useCallback(() => {
        timer.current && clearInterval(timer.current);
    }, []);

    React.useEffect(() => {
        run();
        return () => {
            !!timer.current && clearInterval(timer.current);
        };
    }, [run, timer]);

    return {
        run,
        pause,
    };
}
