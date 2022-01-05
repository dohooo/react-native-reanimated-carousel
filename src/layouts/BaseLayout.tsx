import React from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import type { ComputedDirectionTypes } from 'src/types';
import { useOffsetX } from '../hooks/useOffsetX';
import type { IVisibleRanges } from '../hooks/useVisibleRanges';
import { LazyView } from '../LazyView';

export type IAnimationStyle = Animated.AnimatedStyleProp<
    ViewStyle | ImageStyle | TextStyle
>;

export interface IAnimationConfig {
    animatedStyle: (value: number) => IAnimationStyle;
    deps?: ReadonlyArray<any>;
}

export const BaseLayout: React.FC<
    ComputedDirectionTypes<{
        loop?: boolean;
        index: number;
        handlerOffsetX: Animated.SharedValue<number>;
        data: unknown[];
        visibleRanges: IVisibleRanges;
        animationConfig: IAnimationConfig;
    }>
> = (props) => {
    const {
        handlerOffsetX,
        index,
        children,
        width,
        height,
        loop,
        data,
        visibleRanges,
        animationConfig,
    } = props;

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

    const size = props.vertical ? props.height : props.width;

    const x = useOffsetX(
        {
            handlerOffsetX,
            index,
            size,
            data,
            loop,
        },
        visibleRanges
    );

    const _animatedStyle = useAnimatedStyle(() => {
        return animationConfig.animatedStyle(x.value / size);
    }, [...(animationConfig.deps || [])]);

    const updateView = React.useCallback(
        (negativeRange: number[], positiveRange: number[]) => {
            setShouldUpdate(
                (index >= negativeRange[0] && index <= negativeRange[1]) ||
                    (index >= positiveRange[0] && index <= positiveRange[1])
            );
        },
        [index]
    );

    useAnimatedReaction(
        () => visibleRanges.value,
        () => {
            runOnJS(updateView)(
                visibleRanges.value.negativeRange,
                visibleRanges.value.positiveRange
            );
        },
        [visibleRanges.value]
    );

    return (
        <Animated.View
            style={[
                {
                    width: width || '100%',
                    height: height || '100%',
                    position: 'absolute',
                },
                _animatedStyle,
            ]}
        >
            <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
        </Animated.View>
    );
};
