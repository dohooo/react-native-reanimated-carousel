/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import type { IComputedAnimResult } from 'src/useComputedAnim';
import { useOffsetX } from '../useOffsetX';

export const DefaultLayout: React.FC<{
    parallaxScrollingOffset?: number;
    parallaxScrollingScale?: number;
    handlerOffsetX: Animated.SharedValue<number>;
    index: number;
    width: number;
    computedAnimResult: IComputedAnimResult;
}> = (props) => {
    const {
        handlerOffsetX,
        parallaxScrollingOffset = 100,
        parallaxScrollingScale = 0.8,
        index,
        width,
        children,
        computedAnimResult,
    } = props;
    const x = useOffsetX({ handlerOffsetX, index, width, computedAnimResult });

    const animStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            x.value,
            [-width, 0, width],
            [parallaxScrollingOffset, 0, -parallaxScrollingOffset],
            Extrapolate.CLAMP
        );
        const scale = interpolate(
            x.value,
            [-width, 0, width],
            [parallaxScrollingScale, 1, parallaxScrollingScale],
            Extrapolate.CLAMP
        );
        return {
            transform: [{ translateX }, { scale }],
        };
    }, [parallaxScrollingOffset, parallaxScrollingScale]);

    return (
        <View style={styles.container}>
            <Animated.View style={[{ width: '80%', height: '80%' }, animStyle]}>
                {children}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { justifyContent: 'center', alignItems: 'center', flex: 1 },
});
