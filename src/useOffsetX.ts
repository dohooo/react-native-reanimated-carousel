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
    const { MAX, WL, MIN, LENGTH } = computedAnimResult;
    const x = useDerivedValue(() => {
        if (loop) {
            const Wi = width * index;
            const startPos = Wi > MAX ? MAX - Wi : Wi < MIN ? MIN - Wi : Wi;
            const inputRange = [
                -WL,
                -((LENGTH - 2) * width + width / 2) - startPos - 1,
                -((LENGTH - 2) * width + width / 2) - startPos,
                0,
                (LENGTH - 2) * width + width / 2 - startPos,
                (LENGTH - 2) * width + width / 2 - startPos + 1,
                WL,
            ];
            const outputRange = [
                startPos,
                1.5 * width - 1,
                -((LENGTH - 2) * width + width / 2),
                startPos,
                (LENGTH - 2) * width + width / 2,
                -(1.5 * width - 1),
                startPos,
            ];
            return interpolate(
                handlerOffsetX.value,
                inputRange,
                outputRange,
                Extrapolate.CLAMP
            );
        }

        const startPos = width * index;
        return handlerOffsetX.value + startPos;
    }, [loop]);
    return x;
};
