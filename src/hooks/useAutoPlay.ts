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
    const stopped = React.useRef<boolean>(!autoPlay);

    const play = React.useCallback(() => {
        if (stopped.current) {
            return;
        }

        timer.current = setTimeout(() => {
            autoPlayReverse
                ? carouselController.prev({ onFinished: play })
                : carouselController.next({ onFinished: play });
        }, autoPlayInterval);
    }, [autoPlayReverse, autoPlayInterval, carouselController]);

    const pause = React.useCallback(() => {
        timer.current && clearInterval(timer.current);
        stopped.current = true;
    }, []);

    const start = React.useCallback(() => {
        stopped.current = false;
        play();
    }, [play]);

    React.useEffect(() => {
        if (autoPlay) {
            start();
        } else {
            pause();
        }
        return pause;
    }, [pause, start, autoPlay]);

    return {
        pause,
        start,
    };
}
