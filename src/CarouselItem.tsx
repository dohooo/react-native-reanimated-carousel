import React from 'react';
import { FlexStyle, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useOffsetX } from './hooks/useOffsetX';
import type { IVisibleRanges } from './hooks/useVisibleRanges';

export const CarouselItem: React.FC<{
    loop?: boolean;
    index: number;
    handlerOffsetX: Animated.SharedValue<number>;
    width: number;
    data: unknown[];
    height?: FlexStyle['height'];
    visibleRanges: IVisibleRanges;
}> = (props) => {
    const {
        handlerOffsetX,
        index,
        children,
        width,
        height = '100%',
        loop,
        data,
        visibleRanges,
    } = props;

    const x = useOffsetX(
        {
            handlerOffsetX,
            index,
            width,
            data,
            loop,
        },
        visibleRanges
    );

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
