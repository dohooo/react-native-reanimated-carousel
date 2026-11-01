import * as React from "react";

import type { CarouselController } from "./useCarouselController";

export interface AutoPlayControls {
  /** Stops autoplay until `start` is called, for example while the user touches the carousel. */
  pause: () => void;
  /** Resumes autoplay and begins a fresh dwell. */
  start: () => void;
  /** Begins a fresh dwell if autoplay is running. */
  trigger: () => void;
  /** A transition started from any source: drop the pending dwell without stopping autoplay. */
  onTransitionStart: () => void;
  /** A transition settled from any source: begin a fresh dwell if autoplay is running. */
  onTransitionEnd: () => void;
}

/**
 * Autoplay waits `autoplayInterval` of idle time, then steps once. The dwell is restarted
 * when a transition settles, whatever started it (an autoplay step, `ref.next/prev/scrollTo`,
 * or a pagination tap), so a manual move never cuts the next dwell short and an interrupted
 * autoplay step does not stop autoplay.
 */
export function useAutoPlay(options: {
  autoplay?: boolean;
  autoplayInterval?: number;
  autoplayDirection?: "forward" | "backward";
  carouselController: CarouselController;
}): AutoPlayControls {
  const {
    autoplay = false,
    autoplayDirection = "forward",
    autoplayInterval,
    carouselController,
  } = options;
  const { prev, next } = carouselController;
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped = React.useRef(!autoplay);

  const clearDwell = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const play = React.useCallback(() => {
    if (stopped.current) return;

    clearDwell();
    timer.current = setTimeout(() => {
      timer.current = null;
      // The step settles through `onTransitionEnd`, which starts the next dwell.
      if (autoplayDirection === "backward") prev();
      else next();
    }, autoplayInterval);
  }, [autoplayDirection, autoplayInterval, clearDwell, next, prev]);

  const pause = React.useCallback(() => {
    if (!autoplay) return;

    clearDwell();
    stopped.current = true;
  }, [autoplay, clearDwell]);

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

  return React.useMemo(
    () => ({
      pause,
      start,
      trigger: play,
      onTransitionStart: clearDwell,
      onTransitionEnd: play,
    }),
    [clearDwell, pause, play, start]
  );
}
