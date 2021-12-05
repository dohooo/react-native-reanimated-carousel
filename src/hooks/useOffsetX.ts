import Animated, {
    Extrapolate,
    interpolate,
    useDerivedValue,
} from 'react-native-reanimated';
import type { IComputedAnimResult } from './useComputedAnim';

interface IOpts {
    index: number;
    width: number;
    computedAnimResult: IComputedAnimResult;
    handlerOffsetX: Animated.SharedValue<number>;
    loop?: boolean;
}

export const useOffsetX = (opts: IOpts) => {
    const { handlerOffsetX, index, width, computedAnimResult, loop } = opts;
    const x = useDerivedValue(() => {
        const { ITEM_LENGTH } = computedAnimResult;
        const VALID_LENGTH = ITEM_LENGTH - 1;
        const TOTAL_WIDTH = width * ITEM_LENGTH;
        const HALF_WIDTH = 0.5 * width;

        if (loop) {
            function getDefaultPos(
                type: 'positive' | 'negative' = 'positive',
                _length: number
            ) {
                const defaultPos = width * index;
                let length = null;
                if (type === 'positive') {
                    length = _length;
                } else {
                    length = VALID_LENGTH - _length;
                }
                const boundary = length * width;

                if (defaultPos > boundary) {
                    return boundary - defaultPos;
                }
                return defaultPos;
            }

            const ccc = 2;
            const startPos = getDefaultPos('positive', ccc);

            const MAX = ccc * width;
            const MIN = -((VALID_LENGTH - ccc) * width);

            const inputRange = [
                -TOTAL_WIDTH,
                MIN - HALF_WIDTH - startPos - 1,
                MIN - HALF_WIDTH - startPos,
                0,
                MAX + HALF_WIDTH - startPos,
                MAX + HALF_WIDTH - startPos + 1,
                TOTAL_WIDTH,
            ];

            const outputRange = [
                startPos,
                ccc * width + HALF_WIDTH - 1,
                MIN - HALF_WIDTH,
                startPos,
                MAX + HALF_WIDTH,
                -((VALID_LENGTH - ccc) * width) - HALF_WIDTH + 1,
                startPos,
            ];

            return interpolate(
                Math.round(handlerOffsetX.value),
                inputRange.map(Math.round),
                outputRange.map(Math.round),
                Extrapolate.CLAMP
            );
        }

        const startPos = width * index;
        return handlerOffsetX.value + startPos;
    }, [loop, computedAnimResult]);
    return x;
};
