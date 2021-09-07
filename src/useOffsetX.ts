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
    const { MAX, WL, MIN } = computedAnimResult;
    const x = useDerivedValue(() => {
        const Wi = width * index;
        const startPos = Wi > MAX ? MAX - Wi : Wi < MIN ? MIN - Wi : Wi;
        const inputRange = [
            -WL,
            -WL / 2 - startPos - 1,
            -WL / 2 - startPos,
            0,
            WL / 2 - startPos,
            WL / 2 - startPos + 1,
            WL,
        ];
        const outputRange = [
            startPos,
            WL / 2 - 1,
            -WL / 2,
            startPos,
            WL / 2,
            -WL / 2 + 1,
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
