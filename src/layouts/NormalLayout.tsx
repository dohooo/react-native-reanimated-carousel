import React from 'react';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import type { ComputedDirectionTypes } from 'src/types';
import { useOffsetX } from '../hooks/useOffsetX';
import type { IVisibleRanges } from '../hooks/useVisibleRanges';
import { LazyView } from '../LazyView';

export const NormalLayout: React.FC<
    ComputedDirectionTypes<{
        loop?: boolean;
        index: number;
        handlerOffsetX: Animated.SharedValue<number>;
        data: unknown[];
        visibleRanges: IVisibleRanges;
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
        vertical,
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

    const offsetXStyle = useAnimatedStyle(() => {
        const value = x.value / size;
        const translate = interpolate(
            value,
            [-1, 0, 1],
            [-size, 0, size],
            Extrapolate.EXTEND
        );

        return {
            transform: [
                vertical
                    ? {
                          translateY: translate,
                      }
                    : {
                          translateX: translate,
                      },
            ],
        };
    }, [vertical]);

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
                offsetXStyle,
            ]}
        >
            <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
        </Animated.View>
    );
};
