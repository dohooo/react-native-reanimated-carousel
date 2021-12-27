import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { log } from '../utils/log';
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
    } = props;

    const handlerOffsetX = useSharedValue(0);

    useAnimatedReaction(
        () => props.handlerOffsetX.value,
        (value) => {
            handlerOffsetX.value = withTiming(value, { duration: 0 });
        },
        []
    );

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
        const startPosition = (x.value - index * size) / size;
        runOnJS(log)(-x.value, ',', startPosition, `【${index}】`);
        return {
            transform: [
                {
                    translateX: interpolate(
                        startPosition,
                        [-(index + 1), -index, 0],
                        [-(PAGE_WIDTH - size) * 2, 0, 0]
                    ),
                },
                {
                    scale: interpolate(
                        startPosition,
                        [-(index + 1), -index, 0, data.length - index],
                        [
                            1,
                            1,
                            1 - index * 0.09,
                            1 - (data.length - index) * 0.09,
                        ]
                    ),
                },
                {
                    rotateZ: `${interpolate(
                        startPosition,
                        [-(index + 1), -index, 0],
                        [-135, 0, 0]
                    )}deg`,
                },
                {
                    translateY: interpolate(
                        startPosition,
                        [-(index + 1), -index, 0, data.length - index],
                        [
                            0,
                            0,
                            index * size * 0.12,
                            (data.length - index) * size * 0.12,
                        ]
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
