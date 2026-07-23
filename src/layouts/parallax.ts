import { Extrapolation, interpolate } from "react-native-reanimated";

import type { CarouselLayout } from "../types";
import type { CarouselDirectionSign } from "../utils/carousel-direction";
import { toPhysicalHorizontalValue } from "../utils/carousel-direction";

type ParallaxLayout = Extract<CarouselLayout, { type: "parallax" }>;

export function parallaxLayout(
  baseConfig: {
    size: number;
    isVertical: boolean;
    directionSign: CarouselDirectionSign;
  },
  config: ParallaxLayout
) {
  const { size, isVertical, directionSign } = baseConfig;
  const { offset = 100, scale = 0.8, adjacentScale = scale ** 2 } = config;

  return (relativeProgress: number) => {
    "worklet";
    const logicalTranslate = interpolate(
      relativeProgress,
      [-1, 0, 1],
      [-size + offset, 0, size - offset]
    );
    const translate = isVertical
      ? logicalTranslate
      : toPhysicalHorizontalValue(logicalTranslate, directionSign);

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
