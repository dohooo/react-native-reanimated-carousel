import * as React from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';

export interface IIndexController {
    length: number;
    sharedPreIndex: React.MutableRefObject<number>;
    sharedIndex: React.MutableRefObject<number>;
    index: Animated.SharedValue<number>;
    computedIndex: () => void;
}

export function useIndexController(opts: {
    handlerOffsetX: Animated.SharedValue<number>;
    loop: boolean;
    // the length before fill data
    originalLength: number;
    length: number;
    width: number;
    onChange: (index: number) => void;
}): IIndexController {
    const { originalLength, length, width, loop, handlerOffsetX, onChange } =
        opts;
    const index = useSharedValue<number>(0);
    // The Index displayed to the user
    const sharedIndex = React.useRef<number>(0);
    const sharedPreIndex = React.useRef<number>(0);

    const convertToSharedIndex = React.useCallback(
        (i: number) => {
            if (loop) {
                switch (originalLength) {
                    case 1:
                        return 0;
                    case 2:
                        return i % 2;
                }
            }
            return i;
        },
        [originalLength, loop]
    );

    const computedIndex = React.useCallback(() => {
        sharedPreIndex.current = sharedIndex.current;
        const toInt = Math.round((handlerOffsetX.value / width) % length);
        const i =
            handlerOffsetX.value <= 0
                ? Math.abs(toInt)
                : Math.abs(toInt > 0 ? length - toInt : 0);
        index.value = i;
        const _sharedIndex = convertToSharedIndex(i);
        sharedIndex.current = _sharedIndex;
        onChange(_sharedIndex);
    }, [
        length,
        handlerOffsetX,
        sharedPreIndex,
        index,
        width,
        sharedIndex,
        convertToSharedIndex,
        onChange,
    ]);

    return { length, index, sharedPreIndex, sharedIndex, computedIndex };
}
