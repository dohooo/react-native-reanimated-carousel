/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useOffsetX } from '../hooks/useOffsetX';

export const ParallaxLayout: React.FC<{
    loop?: boolean;
    parallaxScrollingOffset?: number;
    parallaxScrollingScale?: number;
    handlerOffsetX: Animated.SharedValue<number>;
    index: number;
    width: number;
    data: unknown[];
}> = (props) => {
    const {
        handlerOffsetX,
        parallaxScrollingOffset = 100,
        parallaxScrollingScale = 0.8,
        index,
        width,
        loop,
        data,
        children,
    } = props;

    const x = useOffsetX({
        handlerOffsetX,
        index,
        width,
        data,
        loop,
    });

    const offsetXStyle = useAnimatedStyle(() => {
        const baseTranslateX = x.value - index * width;
        const padding = (1 - parallaxScrollingScale) * width;
        const extraOffset = index * padding + padding / 2;

        const zIndex = interpolate(
            x.value,
            [-width, 0, width],
            [0, width, 0],
            Extrapolate.CLAMP
        );
        const scale = interpolate(
            x.value,
            [-width, 0, width],
            [parallaxScrollingScale, 1, parallaxScrollingScale],
            Extrapolate.CLAMP
        );
        const relatedTranslateX = interpolate(
            x.value,
            [-width, 0, width],
            [parallaxScrollingOffset, 0, -parallaxScrollingOffset],
            Extrapolate.CLAMP
        );
        return {
            transform: [
                {
                    translateX:
                        baseTranslateX + extraOffset + relatedTranslateX,
                },
                { scale },
            ],
            zIndex,
        };
    }, [loop]);

    return (
        <Animated.View
            style={[
                {
                    width: `${parallaxScrollingScale * 100}%`,
                    height: `${parallaxScrollingScale * 100}%`,
                    alignSelf: 'center',
                },
                offsetXStyle,
            ]}
        >
            <View style={{ flex: 1 }}>{children}</View>
        </Animated.View>
    );
};
