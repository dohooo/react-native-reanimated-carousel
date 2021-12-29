import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useOffsetX } from '../hooks/useOffsetX';
import type { IVisibleRanges } from '../hooks/useVisibleRanges';
import { LazyView } from '../LazyView';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

export const StackLayout: React.FC<{
    loop?: boolean;
    handlerOffsetX: Animated.SharedValue<number>;
    index: number;
    width: number;
    height: number;
    data: unknown[];
    visibleRanges: IVisibleRanges;
    vertical?: boolean;
}> = (props) => {
    const {
        index,
        width,
        height,
        loop,
        data,
        children,
        visibleRanges,
        vertical,
        handlerOffsetX,
    } = props;

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

    const size = vertical ? height : width;

    const x = useOffsetX(
        {
            handlerOffsetX,
            index,
            size,
            data,
            loop,
            type: 'negative',
            viewCount: 1,
        },
        visibleRanges
    );

    const offsetXStyle = useAnimatedStyle(() => {
        const value = x.value / size;
        const showLength = 3;
        const validLength = showLength - 1;

        return {
            transform: [
                {
                    translateX: interpolate(
                        value,
                        [-1, 0, validLength],
                        [-PAGE_WIDTH, 0, 0],
                        Extrapolate.CLAMP
                    ),
                },
                {
                    scale: interpolate(
                        value,
                        [0, validLength],
                        [1, 1 - validLength * 0.08],
                        Extrapolate.CLAMP
                    ),
                },
                {
                    rotateZ: `${interpolate(
                        value,
                        [-1, 0],
                        [-135, 0],
                        Extrapolate.CLAMP
                    )}deg`,
                },
                {
                    translateY: interpolate(
                        value,
                        [0, validLength],
                        [0, validLength * 30],
                        Extrapolate.CLAMP
                    ),
                },
            ],
            zIndex: -interpolate(
                (x.value - index * size) / size,
                [-index - 1, -index - 0.5, -index, 0, data.length - index],
                [
                    Number.MAX_VALUE,
                    Number.MIN_VALUE,
                    0,
                    index * size * 0.12,
                    (data.length - index) * size * 0.12,
                ]
            ),
        };
    }, [loop, vertical]);

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
                    width,
                    height,
                    position: 'absolute',
                },
                offsetXStyle,
                styles.container,
            ]}
        >
            <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
    },
});
