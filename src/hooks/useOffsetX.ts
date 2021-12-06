import Animated, {
    Extrapolate,
    interpolate,
    useDerivedValue,
} from 'react-native-reanimated';

interface IOpts {
    index: number;
    width: number;
    handlerOffsetX: Animated.SharedValue<number>;
    data: unknown[];
    type?: 'positive' | 'negative';
    viewCount?: number;
    loop?: boolean;
}

export const useOffsetX = (opts: IOpts) => {
    const {
        handlerOffsetX,
        index,
        width,
        loop,
        data,
        type = 'positive',
        viewCount = Math.round((data.length - 1) / 2),
    } = opts;
    const ITEM_LENGTH = data.length;
    const VALID_LENGTH = ITEM_LENGTH - 1;
    const TOTAL_WIDTH = width * ITEM_LENGTH;
    const HALF_WIDTH = 0.5 * width;

    const x = useDerivedValue(() => {
        if (loop) {
            const postiveCount =
                type === 'positive' ? viewCount : VALID_LENGTH - viewCount;

            let startPos = width * index;
            if (index > postiveCount) {
                startPos = (index - ITEM_LENGTH) * width;
            }

            const MAX = postiveCount * width;
            const MIN = -((VALID_LENGTH - postiveCount) * width);

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
                MAX + HALF_WIDTH - 1,
                MIN - HALF_WIDTH,
                startPos,
                MAX + HALF_WIDTH,
                MIN - HALF_WIDTH + 1,
                startPos,
            ];

            return interpolate(
                Math.round(handlerOffsetX.value),
                inputRange.map(Math.round),
                outputRange.map(Math.round),
                Extrapolate.CLAMP
            );
        }

        return handlerOffsetX.value + width * index;
    }, [loop, data, viewCount, type]);

    return x;
};
