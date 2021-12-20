import React from 'react';
import { StyleSheet } from 'react-native';
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
        handlerOffsetX,
        index,
        width,
        height,
        loop,
        data,
        children,
        visibleRanges,
        vertical,
    } = props;

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

    const size = React.useMemo(
        () => (vertical ? height : width),
        [vertical, width, height]
    );

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
        const startPosition = (x.value - index * width) / width;

        return {
            left: interpolate(
                startPosition,
                [-(index + 1), -index, 0],
                [-width, 0, 0],
                Extrapolate.CLAMP
            ),
            transform: [
                {
                    scale: interpolate(
                        startPosition,
                        [-(index + 1), -index, 0, data.length - index],
                        [
                            0.7,
                            0.7,
                            0.7 - index * 0.1,
                            0.7 - (data.length - index) * 0.1,
                        ]
                    ),
                },
                {
                    rotateZ: `${interpolate(
                        startPosition,
                        [-(index + 1), -index, 0],
                        [-45, 0, 0]
                    )}deg`,
                },
                {
                    translateY: interpolate(
                        startPosition,
                        [-(index + 1), -index, 0, data.length - index],
                        [0, 0, index * 40, (data.length - index) * 40]
                    ),
                },
            ],
            zIndex: -x.value,
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
