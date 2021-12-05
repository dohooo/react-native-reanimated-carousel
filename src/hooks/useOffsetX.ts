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
        viewCount = 1,
    } = opts;
    const ITEM_LENGTH = data.length;
    const VALID_LENGTH = ITEM_LENGTH - 1;
    const TOTAL_WIDTH = width * ITEM_LENGTH;
    const HALF_WIDTH = 0.5 * width;

    const x = useDerivedValue(() => {
        const defaultPos = width * index;
        if (loop) {
            function getDefaultPos(
                _type: 'positive' | 'negative',
                _count: number
            ) {
                let boundary = null;

                if (_type === 'positive') {
                    boundary = _count * width;
                } else {
                    boundary = (VALID_LENGTH - _count) * width;
                }

                if (defaultPos > boundary) {
                    return boundary - defaultPos;
                }
                return defaultPos;
            }

            const startPos = getDefaultPos(type, viewCount);
            const MAX = viewCount * width;
            const MIN = -((VALID_LENGTH - viewCount) * width);

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

        return handlerOffsetX.value + defaultPos;
    }, [loop, data, viewCount, type]);

    return x;
};
