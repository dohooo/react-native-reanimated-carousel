import React from 'react';
import {
    Dimensions,
    StyleSheet,
    TransformsStyle,
    ViewStyle,
} from 'react-native';
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

export type StackAnimationConfig = {
    mode: 'vertical' | 'horizontal';
    moveSize?: number;
    stackInterval?: number;
    scaleInterval?: number;
    opacityInterval?: number;
    rotateZDeg?: number;
    snapDirection?: 'left' | 'right';
};

export const StackLayout: React.FC<{
    loop?: boolean;
    handlerOffsetX: Animated.SharedValue<number>;
    index: number;
    width: number;
    height: number;
    showLength: number;
    data: unknown[];
    visibleRanges: IVisibleRanges;
    vertical?: boolean;
    animationConfig?: StackAnimationConfig;
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
        showLength = 4,
    } = props;

    const [shouldUpdate, setShouldUpdate] = React.useState(false);

    const size = vertical ? height : width;

    const animationConfig: Required<StackAnimationConfig> = {
        mode: 'vertical',
        snapDirection: 'left',
        moveSize: window.width,
        stackInterval: 18,
        scaleInterval: 0.04,
        opacityInterval: 0.1,
        rotateZDeg: 30,
        ...props.animationConfig,
    };

    const x = useOffsetX(
        {
            handlerOffsetX,
            index,
            size,
            data,
            loop,
            type:
                animationConfig.snapDirection === 'left'
                    ? 'negative'
                    : 'positive',
            viewCount: 1,
        },
        visibleRanges
    );

    if (showLength < 0 || showLength > data.length - 1) {
        throw Error(
            'The number of presentations should be 0 - (data.length - 1)'
        );
    }

    const offsetXStyle = useAnimatedStyle(() => {
        function easeInOutCubic(v: number): number {
            return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
        }
        let value = x.value / size;
        const page = Math.floor(Math.abs(value));
        const diff = Math.abs(value) % 1;
        value =
            value < 0
                ? -(page + easeInOutCubic(diff))
                : page + easeInOutCubic(diff);

        const VALID_LENGTH = showLength - 1;
        const transform: TransformsStyle['transform'] = [];

        let zIndex: number;
        let inputRange: [number, number, number];
        let opacity: number;

        if (animationConfig.snapDirection === 'left') {
            inputRange = [-1, 0, VALID_LENGTH];

            zIndex =
                Math.floor(
                    interpolate(
                        value,
                        [-1.5, -1, -1 + Number.MIN_VALUE, 0, VALID_LENGTH],
                        [
                            Number.MIN_VALUE,
                            VALID_LENGTH,
                            VALID_LENGTH,
                            VALID_LENGTH - 1,
                            -1,
                        ]
                    ) * 10000
                ) / 100;

            opacity = interpolate(
                value,
                [-1, 0, VALID_LENGTH - 1, VALID_LENGTH],
                [
                    0.25,
                    1,
                    1 - (VALID_LENGTH - 1) * animationConfig.opacityInterval,
                    0.25,
                ]
            );
        } else if (animationConfig.snapDirection === 'right') {
            inputRange = [-VALID_LENGTH, 0, 1];

            zIndex =
                Math.floor(
                    interpolate(
                        value,
                        [-VALID_LENGTH, 0, 1 - Number.MIN_VALUE, 1, 1.5],
                        [
                            1,
                            VALID_LENGTH - 1,
                            VALID_LENGTH,
                            VALID_LENGTH,
                            Number.MIN_VALUE,
                        ]
                    ) * 10000
                ) / 100;
            opacity = interpolate(
                value,
                [-VALID_LENGTH, 1 - VALID_LENGTH, 0, 1],
                [
                    0.25,
                    1 - (VALID_LENGTH - 1) * animationConfig.opacityInterval,
                    1,
                    0.25,
                ]
            );
        } else {
            throw Error(
                'snapDirection snapDirection must be set to either left or right'
            );
        }

        const styles: ViewStyle = {
            transform,
            zIndex,
            opacity,
        };

        if (animationConfig.mode === 'vertical') {
            const {
                snapDirection,
                moveSize,
                rotateZDeg,
                stackInterval,
                scaleInterval,
            } = animationConfig;

            let translateX: number;
            let scale: number;
            let rotateZ: string;
            let translateY: number;

            if (snapDirection === 'left') {
                translateX = interpolate(
                    value,
                    inputRange,
                    [-moveSize, 0, 0],
                    Extrapolate.CLAMP
                );
                scale = interpolate(
                    value,
                    inputRange,
                    [1, 1, 1 - VALID_LENGTH * scaleInterval],
                    Extrapolate.CLAMP
                );
                rotateZ = `${interpolate(
                    value,
                    inputRange,
                    [-rotateZDeg, 0, 0],
                    Extrapolate.CLAMP
                )}deg`;
                translateY = interpolate(
                    value,
                    inputRange,
                    [0, 0, VALID_LENGTH * stackInterval],
                    Extrapolate.CLAMP
                );
            } else if (snapDirection === 'right') {
                translateX = interpolate(
                    value,
                    inputRange,
                    [0, 0, moveSize],
                    Extrapolate.CLAMP
                );
                scale = interpolate(
                    value,
                    inputRange,
                    [1 - VALID_LENGTH * scaleInterval, 1, 1],
                    Extrapolate.CLAMP
                );
                rotateZ = `${interpolate(
                    value,
                    inputRange,
                    [0, 0, rotateZDeg],
                    Extrapolate.CLAMP
                )}deg`;
                translateY = interpolate(
                    value,
                    inputRange,
                    [VALID_LENGTH * stackInterval, 0, 0],
                    Extrapolate.CLAMP
                );
            }

            transform.push(
                {
                    translateX: translateX!,
                },
                {
                    scale: scale!,
                },
                {
                    rotateZ: rotateZ!,
                },
                {
                    translateY: translateY!,
                }
            );
        }

        if (animationConfig.mode === 'horizontal') {
            const {
                snapDirection,
                moveSize,
                rotateZDeg,
                stackInterval,
                scaleInterval,
            } = animationConfig;

            let translateX: number;
            let scale: number;
            let rotateZ: string;

            if (snapDirection === 'left') {
                translateX = interpolate(
                    value,
                    inputRange,
                    [-moveSize, 0, VALID_LENGTH * stackInterval],
                    Extrapolate.CLAMP
                );
                scale = interpolate(
                    value,
                    inputRange,
                    [1, 1, 1 - VALID_LENGTH * scaleInterval],
                    Extrapolate.CLAMP
                );
                rotateZ = `${interpolate(
                    value,
                    inputRange,
                    [-rotateZDeg, 0, 0],
                    Extrapolate.CLAMP
                )}deg`;
            } else if (snapDirection === 'right') {
                translateX = interpolate(
                    value,
                    inputRange,
                    [-VALID_LENGTH * stackInterval, 0, moveSize],
                    Extrapolate.CLAMP
                );
                scale = interpolate(
                    value,
                    inputRange,
                    [1 - VALID_LENGTH * scaleInterval, 1, 1],
                    Extrapolate.CLAMP
                );
                rotateZ = `${interpolate(
                    value,
                    inputRange,
                    [0, 0, rotateZDeg],
                    Extrapolate.CLAMP
                )}deg`;
            }

            transform.push(
                {
                    translateX: translateX!,
                },
                {
                    scale: scale!,
                },
                {
                    rotateZ: rotateZ!,
                }
            );
        }

        return styles;
    }, [loop, vertical, showLength, animationConfig]);

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
