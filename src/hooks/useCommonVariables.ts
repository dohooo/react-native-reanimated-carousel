import React from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';
import type { TInitializeCarouselProps } from './useInitProps';

interface ICommonVariables {
    size: number;
    validLength: number;
    handlerOffsetX: Animated.SharedValue<number>;
}

export function useCommonVariables(
    props: TInitializeCarouselProps<any>
): ICommonVariables {
    const { vertical, height, width, data, defaultIndex } = props;
    const size = vertical ? height : width;
    const validLength = data.length - 1;
    const defaultHandlerOffsetX = -Math.abs(defaultIndex * size);
    const handlerOffsetX = useSharedValue<number>(defaultHandlerOffsetX);

    React.useEffect(() => {
        handlerOffsetX.value = defaultHandlerOffsetX;
    }, [vertical, handlerOffsetX, defaultHandlerOffsetX]);

    return {
        size,
        validLength,
        handlerOffsetX,
    };
}
