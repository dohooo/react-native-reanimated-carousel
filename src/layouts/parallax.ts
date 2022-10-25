import { Extrapolate, interpolate } from "react-native-reanimated";

import type { IComputedDirectionTypes } from "../types";

interface TBaseConfig {
  size: number
  vertical: boolean
}

export interface ILayoutConfig {
  /**
     * control prev/next item offset.
     * @default 100
     */
  parallaxScrollingOffset?: number
  /**
     * control prev/current/next item offset.
     * @default 0.8
     */
  parallaxScrollingScale?: number
  /**
     * control prev/next item offset.
     * @default Math.pow(parallaxScrollingScale, 2)
     */
  parallaxAdjacentItemScale?: number
}

export type TParallaxModeProps = IComputedDirectionTypes<{
  /**
     * Carousel Animated transitions.
     */
  mode?: "parallax"
  modeConfig?: ILayoutConfig
}>;

export function parallaxLayout(
  baseConfig: TBaseConfig,
  modeConfig: ILayoutConfig = {},
) {
  const { size, vertical } = baseConfig;
  const {
    parallaxScrollingOffset = 100,
    parallaxScrollingScale = 0.8,
    parallaxAdjacentItemScale = parallaxScrollingScale ** 2,
  } = modeConfig;

  return (value: number) => {
    "worklet";
    const translate = interpolate(
      value,
      [-1, 0, 1],
      [-size + parallaxScrollingOffset, 0, size - parallaxScrollingOffset],
    );

    const zIndex = interpolate(
      value,
      [-1, 0, 1],
      [0, size, 0],
      Extrapolate.CLAMP,
    );

    const scale = interpolate(
      value,
      [-1, 0, 1],
      [
        parallaxAdjacentItemScale,
        parallaxScrollingScale,
        parallaxAdjacentItemScale,
      ],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        vertical
          ? {
            translateY: translate,
          }
          : {
            translateX: translate,
          },
        {
          scale,
        },
      ],
      zIndex,
    };
  };
}
