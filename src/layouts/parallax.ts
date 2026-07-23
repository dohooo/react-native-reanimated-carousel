import { Extrapolation, interpolate } from "react-native-reanimated";

import type { CarouselLayout } from "../types";

type ParallaxLayout = Extract<CarouselLayout, { type: "parallax" }>;

export function parallaxLayout(
  baseConfig: { size: number; isVertical: boolean },
  config: ParallaxLayout
) {
  const { size, isVertical } = baseConfig;
  const { offset = 100, scale = 0.8, adjacentScale = scale ** 2 } = config;

  return (relativeProgress: number) => {
    "worklet";
    const translate = interpolate(relativeProgress, [-1, 0, 1], [-size + offset, 0, size - offset]);

    const zIndex = Math.round(
      interpolate(relativeProgress, [-1, 0, 1], [0, size, 0], Extrapolation.CLAMP)
    );

    const animatedScale = interpolate(
      relativeProgress,
      [-1, 0, 1],
      [adjacentScale, scale, adjacentScale],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        isVertical ? { translateY: translate } : { translateX: translate },
        { scale: animatedScale },
      ],
      zIndex,
    };
  };
}
