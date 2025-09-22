import * as React from "react";

import type { ICarouselController } from "./useCarouselController";

export function useAutoPlay(opts: {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  autoPlayReverse?: boolean;
  carouselController: ICarouselController;
}) {
  const { autoPlay = false, autoPlayReverse = false, autoPlayInterval, carouselController } = opts;

  const { prev, next } = carouselController;
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped = React.useRef<boolean>(!autoPlay);

  const play = React.useCallback(() => {
    if (stopped.current) return;

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    timer.current = setTimeout(() => {
      autoPlayReverse ? prev({ onFinished: play }) : next({ onFinished: play });
    }, autoPlayInterval);
  }, [autoPlayReverse, autoPlayInterval, prev, next]);

  const pause = React.useCallback(() => {
    if (!autoPlay) return;

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    stopped.current = true;
  }, [autoPlay]);

  const start = React.useCallback(() => {
    if (!autoPlay) return;

    stopped.current = false;
    play();
  }, [play, autoPlay]);

  React.useEffect(() => {
    if (autoPlay) start();
    else pause();

    return pause;
  }, [pause, start, autoPlay]);

  return {
    pause,
    start,
  };
}
