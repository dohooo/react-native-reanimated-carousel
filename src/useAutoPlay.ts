import * as React from 'react';
import type { ICarouselController } from './useCarouselController';
import type { ILockController } from './useLock';

export function useAutoPlay(opts: {
    autoPlay?: boolean;
    autoPlayInterval?: number;
    autoPlayReverse?: boolean;
    carouselController: ICarouselController;
    lockController: ILockController;
}) {
    const {
        autoPlay = false,
        autoPlayReverse = false,
        autoPlayInterval = 1000,
        carouselController,
        lockController,
    } = opts;
    const timer = React.useRef<NodeJS.Timer>();
    React.useEffect(() => {
        if (timer.current) {
            clearInterval(timer.current);
        }
        if (autoPlay && !lockController.isLock()) {
            timer.current = setInterval(() => {
                autoPlayReverse
                    ? carouselController.prev()
                    : carouselController.next();
            }, autoPlayInterval);
        }
        return () => {
            !!timer.current && clearInterval(timer.current);
        };
    }, [
        autoPlay,
        autoPlayReverse,
        autoPlayInterval,
        carouselController,
        lockController,
    ]);
}
