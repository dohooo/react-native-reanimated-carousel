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
            ): {
                MAX: number;
                MIN: number;
                startPos: number;
            } {
                let MAX = null;
                let MIN = null;

                let startPos: number = defaultPos;

                if (_type === 'positive') {
                    MAX = _count * width;
                    MIN = -(VALID_LENGTH - _count) * width;
                } else {
                    MAX = (VALID_LENGTH - _count) * width;
                    MIN = -_count * width;
                }

                if (defaultPos > MAX) {
                    startPos = MAX - defaultPos;
                }

                return {
                    startPos,
                    MAX,
                    MIN,
                };
            }

            const { startPos, MAX, MIN } = getDefaultPos(type, viewCount);

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
