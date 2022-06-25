import { Extrapolate, interpolate } from 'react-native-reanimated';
import type { ComputedDirectionTypes } from '../types';

type TBaseConfig = {
    size: number;
    vertical: boolean;
};

export interface ILayoutConfig {
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
    /**
     * where to align the active item, relative to the container
     * 'auto' will align the first item to the left, the last item to the right
     * @default center
     */
    parallaxAlign?: 'center' | 'auto';
}

export type TParallaxModeProps = ComputedDirectionTypes<{
    /**
     * Carousel Animated transitions.
     */
    mode?: 'parallax';
    modeConfig?: ILayoutConfig;
}>;

export function parallaxLayout(
    baseConfig: TBaseConfig,
    modeConfig: ILayoutConfig = {}
) {
    const { size, vertical } = baseConfig;
    const {
        parallaxScrollingOffset = 100,
        parallaxScrollingScale = 0.8,
        parallaxAdjacentItemScale = Math.pow(parallaxScrollingScale, 2),
        parallaxAlign = 'center',
    } = modeConfig;

    const alignmentOffset = (size - size * parallaxScrollingScale) / 2;

    return (value: number, index: number, length: number) => {
        'worklet';
        const isFirstItem = index === 0;
        const isSecondItem = index === 1;
        const isLastItem = index === length - 1;
        const isPreviousToLastItem = index === length - 2;

        const alignmentOffsetStart = -alignmentOffset;
        const alignmentOffsetEnd = alignmentOffset;

        const shouldAutoAlign = parallaxAlign === 'auto';

        let previousItemX = -size + parallaxScrollingOffset;
        let currentItemX = 0;
        let nextItemX = size - parallaxScrollingOffset;

        if (shouldAutoAlign) {
            if (isFirstItem) {
                currentItemX = alignmentOffsetStart;
            }
            if (isLastItem) {
                currentItemX = alignmentOffsetEnd;
                previousItemX -= alignmentOffsetEnd;
            }
            if (isSecondItem) {
                nextItemX += alignmentOffsetStart;
            }
            if (isPreviousToLastItem) {
                previousItemX += alignmentOffsetEnd;
            }
        }

        const translate = interpolate(
            value,
            [-1, 0, 1],
            [previousItemX, currentItemX, nextItemX]
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
                parallaxAdjacentItemScale,
                parallaxScrollingScale,
                parallaxAdjacentItemScale,
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
