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

    const layoutStyle = React.useMemo(() => {
        return {
            width: !vertical
                ? width * parallaxScrollingScale
                : `${100 * parallaxScrollingScale}%`,
            height: vertical
                ? height * parallaxScrollingScale
                : `${100 * parallaxScrollingScale}%`,
        };
    }, [vertical, parallaxScrollingScale, width, height]);

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
        const baseTranslateX = x.value - index * size;
        const padding = (1 - parallaxScrollingScale) * size;
        const extraOffset = index * padding + padding / 2;

        const zIndex = interpolate(
            x.value,
            [-size, 0, size],
            [0, size, 0],
            Extrapolate.CLAMP
        );
        const scale = interpolate(
            x.value,
            [-size, 0, size],
            [parallaxScrollingScale, 1, parallaxScrollingScale],
            Extrapolate.CLAMP
        );
        const relatedTranslateX = interpolate(
            x.value,
            [-size, 0, size],
            [parallaxScrollingOffset, 0, -parallaxScrollingOffset],
            Extrapolate.CLAMP
        );

        if (vertical) {
            return {
                transform: [
                    {
                        translateY:
                            baseTranslateX + extraOffset + relatedTranslateX,
                    },
                    { scale },
                ],
                zIndex,
            };
        }

        return {
            transform: [
                {
                    translateX:
                        baseTranslateX + extraOffset + relatedTranslateX,
                },
                { scale },
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
        <Animated.View style={[layoutStyle, styles.container, offsetXStyle]}>
            <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
    },
});
