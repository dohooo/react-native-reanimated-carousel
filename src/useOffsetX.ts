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
        const { MAX, MIN, TOTAL_WIDTH, HALF_WIDTH } = computedAnimResult;
        if (loop) {
            const defaultPos = width * index;
            const startPos =
                defaultPos > MAX
                    ? MAX - defaultPos
                    : defaultPos < MIN
                    ? MIN - defaultPos
                    : defaultPos;

            const inputRange = [
                -TOTAL_WIDTH,
                -(MAX + HALF_WIDTH) - startPos - 1,
                -(MAX + HALF_WIDTH) - startPos,
                0,
                MAX + HALF_WIDTH - startPos,
                MAX + HALF_WIDTH - startPos + 1,
                TOTAL_WIDTH,
            ];

            const outputRange = [
                startPos,
                1.5 * width - 1,
                -(MAX + HALF_WIDTH),
                startPos,
                MAX + HALF_WIDTH,
                -(1.5 * width - 1),
                startPos,
            ];

            return interpolate(
                Math.round(handlerOffsetX.value),
                inputRange,
                outputRange,
                Extrapolate.CLAMP
            );
        }

        const startPos = width * index;
        return handlerOffsetX.value + startPos;
    }, [loop, computedAnimResult]);
    return x;
};
