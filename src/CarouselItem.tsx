import React from 'react';
import { FlexStyle, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { IComputedAnimResult } from './useComputedAnim';
import { useOffsetX } from './useOffsetX';

export const CarouselItem: React.FC<{
    loop?: boolean;
    index: number;
    handlerOffsetX: Animated.SharedValue<number>;
    width: number;
    height?: FlexStyle['height'];
    computedAnimResult: IComputedAnimResult;
}> = (props) => {
    const {
        handlerOffsetX,
        index,
        children,
        width,
        height = '100%',
        computedAnimResult,
        loop,
    } = props;
    const x = useOffsetX({
        handlerOffsetX,
        index,
        width,
        computedAnimResult,
        loop,
    });
    const offsetXStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: x.value - index * width }],
        };
    }, []);

    return (
        <Animated.View style={offsetXStyle}>
            <View style={{ width, height }}>{children}</View>
        </Animated.View>
    );
};
