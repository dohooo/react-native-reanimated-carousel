import { Extrapolate, interpolate } from 'react-native-reanimated';

export function parallaxLayout(opts: {
    size: number;
    vertical: boolean;
    parallaxScrollingOffset?: number;
    parallaxScrollingScale?: number;
}) {
    const {
        size,
        vertical,
        parallaxScrollingOffset = 100,
        parallaxScrollingScale = 0.8,
    } = opts;

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
