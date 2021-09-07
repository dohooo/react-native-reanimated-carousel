import Animated, {
    Extrapolate,
    interpolate,
    useDerivedValue,
} from 'react-native-reanimated';
import type { IComputedAnimResult } from './useComputedAnim';

interface IOpts {
    handlerOffsetX: Animated.SharedValue<number>;
    index: number;
    width: number;
    computedAnimResult: IComputedAnimResult;
}

export const useOffsetX = (opts: IOpts) => {
    const { handlerOffsetX, index, width, computedAnimResult } = opts;
    const { MAX, WL, MIN, LENGTH } = computedAnimResult;
    const x = useDerivedValue(() => {
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
    }, []);
    return x;
};
