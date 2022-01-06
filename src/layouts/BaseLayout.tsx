import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import type { ComputedDirectionTypes } from 'src/types';
import { IOpts, useOffsetX } from '../hooks/useOffsetX';
import type { IVisibleRanges } from '../hooks/useVisibleRanges';
import type { TCarouselProps } from '../types';
import { LazyView } from '../LazyView';
import type { StackAnimationConfig } from './stack';

export type TAnimationStyle = (
    value: number
) => Animated.AnimatedStyleProp<ViewStyle>;

export const BaseLayout: React.FC<
    ComputedDirectionTypes<
        {
            loop?: boolean;
            index: number;
            handlerOffsetX: Animated.SharedValue<number>;
            data: unknown[];
            visibleRanges: IVisibleRanges;
            animationStyle: TAnimationStyle;
            animationConfig: {};
        } & Pick<TCarouselProps<unknown>, 'mode' | 'animationConfig'>
    >
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
        animationStyle,
    } = props;

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

    const size = props.vertical ? props.height : props.width;

    let offsetXConfig: IOpts = {
        handlerOffsetX,
        index,
        size,
        data,
        loop,
    };

    if (props.mode === 'horizontal-stack') {
        const { snapDirection, showLength } =
            props.animationConfig as StackAnimationConfig;

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
