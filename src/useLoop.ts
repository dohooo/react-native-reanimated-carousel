import * as React from 'react';
import type { ICarouselController } from './useCarouselController';

export function useLoop(opts: {
    autoPlay?: boolean;
    autoPlayInterval?: number;
    autoPlayReverse?: boolean;
    carouselController: ICarouselController;
}) {
    const {
        autoPlay = false,
        autoPlayReverse = false,
        autoPlayInterval = 1000,
        carouselController,
    } = opts;
    const timer = React.useRef<NodeJS.Timer>();
    React.useEffect(() => {
        if (timer.current) {
            clearInterval(timer.current);
        }
        if (autoPlay) {
            timer.current = setInterval(() => {
                autoPlayReverse
                    ? carouselController.prev()
                    : carouselController.next();
            }, autoPlayInterval);
        }
        return () => {
            !!timer.current && clearInterval(timer.current);
        };
    }, [autoPlay, autoPlayReverse, autoPlayInterval, carouselController]);
}
