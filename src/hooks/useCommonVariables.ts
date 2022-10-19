import React from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';
import type { TInitializeCarouselProps } from './useInitProps';

interface ICommonVariables {
    size: number;
    validLength: number;
    handlerOffset: Animated.SharedValue<number>;
}

export function useCommonVariables(
    props: TInitializeCarouselProps<any>
): ICommonVariables {
    const {
        vertical,
        height,
        width,
        data,
        defaultIndex,
        defaultScrollOffsetValue,
    } = props;
    const size = vertical ? height : width;
    const validLength = data.length - 1;
    const defaultHandlerOffsetValue = -Math.abs(defaultIndex * size);
    const _handlerOffset = useSharedValue<number>(defaultHandlerOffsetValue);
    const handlerOffset = defaultScrollOffsetValue ?? _handlerOffset;

    React.useEffect(() => {
        handlerOffset.value = defaultHandlerOffsetValue;
    }, [vertical, handlerOffset, defaultHandlerOffsetValue]);

    return {
        size,
        validLength,
        handlerOffset,
    };
}
