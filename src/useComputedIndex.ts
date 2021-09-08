import * as React from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';

export function useComputedIndex(opts: {
    handlerOffsetX: Animated.SharedValue<number>;
    length: number;
    width: number;
}) {
    const { length, width, handlerOffsetX } = opts;
    const index = useSharedValue<number>(0);

    const computedIndex = React.useCallback(() => {
        const toInt = (handlerOffsetX.value / width) % length;
        const i =
            handlerOffsetX.value <= 0
                ? Math.abs(toInt)
                : Math.abs(toInt > 0 ? length - toInt : 0);
        index.value = i;
    }, [length, handlerOffsetX, index, width]);

    return { index, computedIndex };
}
