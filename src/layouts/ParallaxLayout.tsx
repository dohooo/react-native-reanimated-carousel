import React from 'react';
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

export const ParallaxLayout: React.FC<{
    loop?: boolean;
    parallaxScrollingOffset?: number;
    parallaxScrollingScale?: number;
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
        parallaxScrollingOffset = 100,
        parallaxScrollingScale = 0.8,
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
        },
        visibleRanges
    );

    const offsetXStyle = useAnimatedStyle(() => {
        const value = x.value / size;

        const translate = interpolate(
            value,
            [-1, 0, 1],
            [
                -size + parallaxScrollingOffset,
                0,
                size - parallaxScrollingOffset,
            ],
            Extrapolate.CLAMP
        );

        const zIndex = interpolate(
            value,
            [-1, 0, 1],
            [0, size, 0],
            Extrapolate.CLAMP
        );

        const scale = interpolate(
            value,
            [-1, 0, 1],
            [
                Math.pow(parallaxScrollingScale, 2),
                parallaxScrollingScale,
                Math.pow(parallaxScrollingScale, 2),
            ],
            Extrapolate.CLAMP
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
                {
                    scale,
                },
            ],
            zIndex,
        };
    }, [loop, vertical, parallaxScrollingOffset]);

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
                    alignSelf: 'center',
                },
                offsetXStyle,
            ]}
        >
            <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
        </Animated.View>
    );
};
