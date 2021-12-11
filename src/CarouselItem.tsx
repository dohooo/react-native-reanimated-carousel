import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useOffsetX } from './hooks/useOffsetX';
import type { IVisibleRanges } from './hooks/useVisibleRanges';

export const CarouselItem: React.FC<{
    loop?: boolean;
    index: number;
    handlerOffsetX: Animated.SharedValue<number>;
    width?: number;
    height?: number;
    data: unknown[];
    visibleRanges: IVisibleRanges;
    vertical?: boolean;
}> = (props) => {
    const {
        handlerOffsetX,
        index,
        children,
        width = 0,
        height = 0,
        loop,
        data,
        visibleRanges,
        vertical,
    } = props;

    const x = useOffsetX(
        {
            handlerOffsetX,
            index,
            size: vertical ? height : width,
            data,
            loop,
        },
        visibleRanges
    );

    const offsetXStyle = useAnimatedStyle(() => {
        if (vertical) {
            return { transform: [{ translateY: x.value - index * height }] };
        }
        return {
            transform: [{ translateX: x.value - index * width }],
        };
    }, [vertical]);

    return (
        <Animated.View
            style={[
                offsetXStyle,
                {
                    width: width || '100%',
                    height: height || '100%',
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};
