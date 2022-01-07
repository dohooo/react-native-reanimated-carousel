import Animated, {
    Extrapolate,
    interpolate,
    useDerivedValue,
} from 'react-native-reanimated';
import type { IVisibleRanges } from './useVisibleRanges';

export interface IOpts {
    index: number;
    size: number;
    handlerOffsetX: Animated.SharedValue<number>;
    data: unknown[];
    type?: 'positive' | 'negative';
    viewCount?: number;
    loop?: boolean;
}

export const useOffsetX = (opts: IOpts, visibleRanges: IVisibleRanges) => {
    const {
        handlerOffsetX,
        index,
        size,
        loop,
        data,
        type = 'positive',
        viewCount = Math.round((data.length - 1) / 2),
    } = opts;

    const ITEM_LENGTH = data.length;
    const VALID_LENGTH = ITEM_LENGTH - 1;
    const TOTAL_WIDTH = size * ITEM_LENGTH;
    const HALF_WIDTH = 0.5 * size;

    const positiveCount =
        type === 'positive' ? viewCount : VALID_LENGTH - viewCount;

    let startPos = size * index;
    if (index > positiveCount) {
        startPos = (index - ITEM_LENGTH) * size;
    }

    const MAX = positiveCount * size;
    const MIN = -((VALID_LENGTH - positiveCount) * size);

    const x = useDerivedValue(() => {
        const { negativeRange, positiveRange } = visibleRanges.value;
        if (
            (index < negativeRange[0] || index > negativeRange[1]) &&
            (index < positiveRange[0] || index > positiveRange[1])
        ) {
            return Number.MAX_SAFE_INTEGER;
        }

        if (loop) {
            const inputRange = [
                -TOTAL_WIDTH,
                MIN - HALF_WIDTH - startPos - Number.MIN_VALUE,
                MIN - HALF_WIDTH - startPos,
                0,
                MAX + HALF_WIDTH - startPos,
                MAX + HALF_WIDTH - startPos + Number.MIN_VALUE,
                TOTAL_WIDTH,
            ];

            const outputRange = [
                startPos,
                MAX + HALF_WIDTH - Number.MIN_VALUE,
                MIN - HALF_WIDTH,
                startPos,
                MAX + HALF_WIDTH,
                MIN - HALF_WIDTH + Number.MIN_VALUE,
                startPos,
            ];

            return interpolate(
                handlerOffsetX.value,
                inputRange,
                outputRange,
                Extrapolate.CLAMP
            );
        }

        return handlerOffsetX.value + size * index;
    }, [loop, data, viewCount, type, size, visibleRanges]);

    return x;
};
