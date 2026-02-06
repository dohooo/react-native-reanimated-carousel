export function computeGestureTranslation(options: {
  loop: boolean;
  overscrollEnabled: boolean;
  currentTranslation: number;
  panOffset: number;
  panTranslation: number;
  max: number;
}): number {
  const { loop, overscrollEnabled, currentTranslation, panOffset, panTranslation, max } = options;
  const raw = panOffset + panTranslation;

  if (loop) return raw;

  if (!overscrollEnabled) {
    // In non-loop mode with overscroll disabled, translation must stay in [-max, 0].
    return Math.min(0, Math.max(-max, raw));
  }

  // Keep resistance behavior only when overscroll is enabled.
  if (currentTranslation > 0 || currentTranslation < -max) {
    const boundary = currentTranslation > 0 ? 0 : -max;
    const fixed = boundary - panOffset;
    const dynamic = panTranslation - fixed;
    return boundary + dynamic * 0.5;
  }

  return raw;
}
