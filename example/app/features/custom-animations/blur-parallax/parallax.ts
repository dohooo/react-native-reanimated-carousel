import { Extrapolation, interpolate } from "react-native-reanimated";
interface BaseConfig {
  size: number;
  vertical: boolean;
}

export interface LayoutConfig {
  /**
   * control prev/next item offset.
   * @default 100
   */
  parallaxScrollingOffset?: number;
  /**
   * control prev/current/next item offset.
   * @default 0.8
   */
  parallaxScrollingScale?: number;
  /**
   * control prev/next item offset.
   * @default Math.pow(parallaxScrollingScale, 2)
   */
  parallaxAdjacentItemScale?: number;
}

export function parallaxLayout(baseConfig: BaseConfig, modeConfig: LayoutConfig = {}) {
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
      [-size + parallaxScrollingOffset, 0, size - parallaxScrollingOffset]
    );

    const zIndex = interpolate(value, [-1, 0, 1], [0, size, 0], Extrapolation.CLAMP);

    const scale = interpolate(
      value,
      [-1, 0, 1],
      [parallaxAdjacentItemScale, parallaxScrollingScale, parallaxAdjacentItemScale],
      Extrapolation.CLAMP
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
