import { Extrapolate, interpolate } from "react-native-reanimated";
import type { IComputedDirectionTypes } from "react-native-reanimated-carousel";

import { withAnchorPoint } from "../../utils/anchor-point";

interface TBaseConfig {
  size: number
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
) {
  const { size } = baseConfig;
  // const {
  //   parallaxScrollingOffset = 100,
  //   parallaxScrollingScale = 0.8,
  //   parallaxAdjacentItemScale = parallaxScrollingScale ** 2,
  // } = modeConfig;

  const parallaxScrollingScale = 1;
  const parallaxAdjacentItemScale = 0.8;
  const parallaxScrollingOffset = -40;

  return (value: number) => {
    "worklet";
    const translateY = interpolate(
      value,
      [-1, 0, 1],
      [-size + parallaxScrollingOffset, 0, size - parallaxScrollingOffset],
    );

    const translateX = interpolate(
      value,
      [-1, 0, 1, 2],
      [-size * 0.2, 0, 0, -size * 0.2],
    );

    const zIndex = interpolate(
      value,
      [-1, 0, 1, 2],
      [0, size, size, 0],
      Extrapolate.CLAMP,
    );

    const scale = interpolate(
      value,
      [-1, 0, 1, 2],
      [
        parallaxAdjacentItemScale,
        parallaxScrollingScale,
        parallaxScrollingScale,
        parallaxAdjacentItemScale,
      ],
      Extrapolate.CLAMP,
    );

    const transform = {
      transform: [
        { translateY },
        { translateX },
        { perspective: 200 },
        {
          rotateY: `${interpolate(
            value,
            [-1, 0, 1, 2],
            [20, 0, 0, 20],
            Extrapolate.CLAMP,
          )}deg`,
        },
        {
          rotateZ: `${interpolate(
            value,
            [-1, 0, 1, 2],
            [-20, 0, 0, -20],
            Extrapolate.CLAMP,
          )}deg`,
        },
        { scale },
      ],
    };

    return {
      ...withAnchorPoint(
        transform,
        { x: 0.5, y: 0.5 },
        { width: size, height: size },
      ),
      zIndex,
    };
  };
}
