import { Extrapolate, interpolate } from 'react-native-reanimated';

type TBaseConfig = {
    size: number;
    vertical: boolean;
};

export interface ILayoutConfig {
    /**
     * When use default Layout props,this prop can be control prev/next item offset.
     * @default 100
     */
    parallaxScrollingOffset?: number;
    /**
     * When use default Layout props,this prop can be control prev/next item offset.
     * @default 0.8
     */
    parallaxScrollingScale?: number;
}

export function parallaxLayout(
    baseConfig: TBaseConfig,
    modeConfig: ILayoutConfig = {}
) {
    const { size, vertical } = baseConfig;
    const { parallaxScrollingOffset = 100, parallaxScrollingScale = 0.8 } =
        modeConfig;

    return (value: number) => {
        'worklet';
        const translate = interpolate(
            value,
            [-1, 0, 1],
            [-size + parallaxScrollingOffset, 0, size - parallaxScrollingOffset]
        );

        const zIndex = interpolate(
            value,
            [-1, 0, 1],
            [0, size, 0],
            Extrapolate.CLAMP
        );

        const scale = interpolate(
            value,
            [-1, 0, 1],
            [
                Math.pow(parallaxScrollingScale, 2),
                parallaxScrollingScale,
                Math.pow(parallaxScrollingScale, 2),
            ],
            Extrapolate.CLAMP
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
