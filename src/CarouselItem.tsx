import React from 'react';
import { FlexStyle, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { IComputedAnimResult } from './useComputedAnim';
import { useOffsetX } from './useOffsetX';

export const CarouselItem: React.FC<{
    index: number;
    handlerOffsetX: Animated.SharedValue<number>;
    width: number;
    height?: FlexStyle['height'];
    onPress?: () => void;
    computedAnimResult: IComputedAnimResult;
}> = (props) => {
    const {
        handlerOffsetX,
        index,
        onPress,
        children,
        width,
        height = '100%',
        computedAnimResult,
    } = props;
    const x = useOffsetX({ handlerOffsetX, index, width, computedAnimResult });
    const offsetXStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: x.value - index * width }],
        };
    }, []);

    return (
        <Animated.View style={offsetXStyle}>
            <TouchableWithoutFeedback onPress={onPress}>
                <View style={{ width, height }}>{children}</View>
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};
