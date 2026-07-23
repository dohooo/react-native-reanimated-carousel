import * as React from "react";

import type { CarouselController } from "./useCarouselController";

export function useAutoPlay(options: {
  autoplay?: boolean;
  autoplayInterval?: number;
  autoplayDirection?: "forward" | "backward";
  carouselController: CarouselController;
}) {
  const {
    autoplay = false,
    autoplayDirection = "forward",
    autoplayInterval,
    carouselController,
  } = options;
  const { prev, next } = carouselController;
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped = React.useRef(!autoplay);

  const play = React.useCallback(() => {
    if (stopped.current) return;

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    timer.current = setTimeout(() => {
      if (autoplayDirection === "backward") prev({ onFinished: play });
      else next({ onFinished: play });
    }, autoplayInterval);
  }, [autoplayDirection, autoplayInterval, next, prev]);

  const pause = React.useCallback(() => {
    if (!autoplay) return;

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    stopped.current = true;
  }, [autoplay]);

  const start = React.useCallback(() => {
    if (!autoplay) return;

    stopped.current = false;
    play();
  }, [autoplay, play]);

  React.useEffect(() => {
    if (autoplay) start();
    else pause();

    return pause;
  }, [autoplay, pause, start]);

  return {
    pause,
    start,
    trigger: play,
  };
}
