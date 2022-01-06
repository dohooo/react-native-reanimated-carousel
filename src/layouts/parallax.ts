import { Extrapolate, interpolate } from 'react-native-reanimated';

type TBaseConfig = {
    size: number;
    vertical: boolean;
};

export type TAnimationConfig = {
    parallaxScrollingOffset?: number;
    parallaxScrollingScale?: number;
};

export function parallaxLayout(
    animationConfig: TAnimationConfig & TBaseConfig
) {
    const {
        size,
        vertical,
        parallaxScrollingOffset = 100,
        parallaxScrollingScale = 0.8,
    } = animationConfig;

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
