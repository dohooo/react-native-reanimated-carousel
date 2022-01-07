import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { IOpts, useOffsetX } from '../hooks/useOffsetX';
import type { IVisibleRanges } from '../hooks/useVisibleRanges';
import { LazyView } from '../LazyView';
import type { IAnimationConfig as IStackAnimationConfig } from './stack';
import { CTX } from '../store';

export type TAnimationStyle = (
    value: number
) => Animated.AnimatedStyleProp<ViewStyle>;

export const BaseLayout: React.FC<{
    index: number;
    handlerOffsetX: Animated.SharedValue<number>;
    visibleRanges: IVisibleRanges;
    animationStyle: TAnimationStyle;
}> = (props) => {
    const { handlerOffsetX, index, children, visibleRanges, animationStyle } =
        props;

    const {
        props: { mode, loop, data, width, height, vertical, animationConfig },
    } = React.useContext(CTX);

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

    const size = vertical ? height : width;

    let offsetXConfig: IOpts = {
        handlerOffsetX,
        index,
        size,
        data,
        loop,
    };

    if (mode === 'horizontal-stack') {
        const { snapDirection, showLength } =
            animationConfig as IStackAnimationConfig;

        offsetXConfig = {
            handlerOffsetX,
            index,
            size,
            data,
            loop,
            type: snapDirection === 'right' ? 'negative' : 'positive',
            viewCount: showLength,
        };
    }

    const x = useOffsetX(offsetXConfig, visibleRanges);

    const _animatedStyle = useAnimatedStyle(
        () => animationStyle(x.value / size),
        [animationStyle]
    );

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
