import React from 'react';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useOffsetX } from './hooks/useOffsetX';
import type { IVisibleRanges } from './hooks/useVisibleRanges';
import { LazyView } from './LazyView';

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

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

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
                offsetXStyle,
                {
                    width: width || '100%',
                    height: height || '100%',
                },
            ]}
        >
            <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
        </Animated.View>
    );
};
