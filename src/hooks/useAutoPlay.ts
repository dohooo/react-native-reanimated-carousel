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

    const pause = React.useCallback(() => {
        timer.current && clearInterval(timer.current);
        stopped.current = true;
    }, []);

    const run = React.useCallback(() => {
        if (stopped.current) {
            return;
        }

        timer.current = setTimeout(() => {
            autoPlayReverse
                ? carouselController.prev({ onFinished: run })
                : carouselController.next({ onFinished: run });
        }, autoPlayInterval);
    }, [autoPlayReverse, autoPlayInterval, carouselController]);

    React.useEffect(() => {
        if (autoPlay) {
            stopped.current = false;
            run();
        } else {
            pause();
        }
        return pause;
    }, [run, pause, autoPlay]);

    return {
        run,
        pause,
    };
}
