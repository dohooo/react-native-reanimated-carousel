import * as React from "react";

import type { ICarouselController } from "./useCarouselController";

export function useAutoPlay(opts: {
  autoPlay?: boolean
  autoPlayInterval?: number
  autoPlayReverse?: boolean
  carouselController: ICarouselController
}) {
  const {
    autoPlay = false,
    autoPlayReverse = false,
    autoPlayInterval,
    carouselController,
  } = opts;

  const { prev, next } = carouselController;
  const lastTimestampRef = React.useRef<number | null>(null);
  const stopped = React.useRef<boolean>(!autoPlay);

  const play = React.useCallback(() => {
    if (stopped.current)
      return;

    const currentTimestamp = Date.now();

    if (lastTimestampRef.current) {
      const elapsed = currentTimestamp - lastTimestampRef.current;

      if (elapsed >= (autoPlayInterval ?? 1000)) {
        autoPlayReverse
          ? prev({ onFinished: play })
          : next({ onFinished: play });
        lastTimestampRef.current = currentTimestamp;
      }
    }
    else {
      lastTimestampRef.current = currentTimestamp;
    }

    requestAnimationFrame(play);
  }, [autoPlayReverse, autoPlayInterval, prev, next]);

  const pause = React.useCallback(() => {
    if (!autoPlay)
      return;

    lastTimestampRef.current = null;
    stopped.current = true;
  }, [autoPlay]);

  const start = React.useCallback(() => {
    if (!autoPlay)
      return;

    stopped.current = false;
    lastTimestampRef.current = Date.now();
    requestAnimationFrame(play);
  }, [play, autoPlay]);

  React.useEffect(() => {
    if (autoPlay)
      start();
    else
      pause();

    return () => {
      lastTimestampRef.current = null;
      stopped.current = true;
    };
  }, [pause, start, autoPlay]);

  return {
    pause,
    start,
  };
}
