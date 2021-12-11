import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useDerivedValue,
    useSharedValue,
    withDecay,
    withSpring,
} from 'react-native-reanimated';

type GestureContext = {
    panOffset: number;
    max: number;
};

interface Props {
    style?: StyleProp<ViewStyle>;
    infinite?: boolean;
    pagingEnabled?: boolean;
    vertical?: boolean;
    panGestureHandlerProps?: Omit<
        Partial<PanGestureHandlerProps>,
        'onHandlerStateChange'
    >;
    onScrollBegin?: () => void;
    onScrollEnd?: () => void;

    translation: Animated.SharedValue<number>;
    totalWidth: number;
    width: number;
    count: number;
}

const IScrollViewGesture: React.FC<Props> = (props) => {
    const {
        style,
        infinite,
        vertical,
        translation,
        pagingEnabled,
        panGestureHandlerProps = {},
        onScrollBegin,
        onScrollEnd,
        totalWidth,
        width,
        count,
    } = props;

    const isHorizontal = useDerivedValue(() => !vertical, [vertical]);
    const touching = useSharedValue(false);
    const scrollEndTranslation = useSharedValue(0);
    const scrollEndVelocity = useSharedValue(0);

    const cLength = totalWidth;
    const svLength = width;
    const maxLength = cLength - svLength;

    const endWithSpring = React.useCallback(
        (toValue: number) => {
            'worklet';
            return withSpring(
                toValue,
                {
                    damping: 100,
                },
                (isFinished) => {
                    if (isFinished) {
                        onScrollEnd && runOnJS(onScrollEnd)();
                    }
                }
            );
        },
        [onScrollEnd]
    );

    const withPaging = React.useCallback(() => {
        'worklet';
        const page = Math.round(-translation.value / svLength);
        const velocityPage = Math.round(
            -(translation.value + scrollEndVelocity.value) / svLength
        );
        let finalPage = Math.min(page + 1, Math.max(page - 1, velocityPage));
        if (!infinite) {
            finalPage = Math.min(count - 1, Math.max(0, finalPage));
        }
        translation.value = endWithSpring(-finalPage * svLength);
    }, [
        infinite,
        endWithSpring,
        translation,
        scrollEndVelocity,
        svLength,
        count,
    ]);

    const resetBoundary = React.useCallback(() => {
        'worklet';
        const onFinish = (isFinished: boolean) => {
            if (isFinished) {
                touching.value = false;
                onScrollEnd && runOnJS(onScrollEnd)();
            }
        };
        const activeDecay = () => {
            touching.value = true;
            translation.value = withDecay(
                { velocity: scrollEndVelocity.value },
                onFinish
            );
        };

        if (touching.value) {
            return;
        }

        if (translation.value > 0) {
            if (scrollEndTranslation.value < 0) {
                activeDecay();
                return;
            }
            if (!infinite) {
                translation.value = endWithSpring(0);
                return;
            }
        }

        if (translation.value < -maxLength) {
            if (scrollEndTranslation.value > 0) {
                activeDecay();
                return;
            }
            if (!infinite) {
                translation.value = endWithSpring(-maxLength);
                return;
            }
        }
    }, [
        infinite,
        touching,
        endWithSpring,
        maxLength,
        translation,
        scrollEndTranslation,
        scrollEndVelocity,
        onScrollEnd,
    ]);

    useAnimatedReaction(
        () => translation.value,
        () => {
            if (!pagingEnabled) {
                resetBoundary();
            }
        },
        [maxLength, pagingEnabled]
    );

    const panGestureEventHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        GestureContext
    >(
        {
            onStart: (_, ctx) => {
                touching.value = true;
                cancelAnimation(translation);
                onScrollBegin && runOnJS(onScrollBegin)();
                ctx.max = cLength - svLength;
                ctx.panOffset = translation.value;
            },
            onActive: (e, ctx) => {
                touching.value = true;
                const { translationX, translationY } = e;
                let panTranslation = isHorizontal.value
                    ? translationX
                    : translationY;

                if (
                    !infinite &&
                    (translation.value > 0 || translation.value < -ctx.max)
                ) {
                    panTranslation = panTranslation * 0.5;
                }

                translation.value = ctx.panOffset + panTranslation;
            },
            onEnd: (e) => {
                const { velocityX, velocityY, translationX, translationY } = e;
                scrollEndVelocity.value = isHorizontal.value
                    ? velocityX
                    : velocityY;
                scrollEndTranslation.value = isHorizontal.value
                    ? translationX
                    : translationY;

                if (pagingEnabled) {
                    withPaging();
                    return;
                }
                translation.value = withDecay(
                    {
                        velocity: scrollEndVelocity.value,
                    },
                    (isFinished) => {
                        if (isFinished) {
                            onScrollEnd && runOnJS(onScrollEnd)();
                        }
                    }
                );

                if (!infinite) {
                    touching.value = false;
                }
            },
        },
        [pagingEnabled, isHorizontal.value, infinite, cLength, svLength]
    );

    const directionStyle = React.useMemo(() => {
        return vertical ? styles.contentHorizontal : styles.contentVertical;
    }, [vertical]);

    return (
        <Animated.View style={[styles.container, directionStyle, style]}>
            <PanGestureHandler
                {...panGestureHandlerProps}
                onGestureEvent={panGestureEventHandler}
            >
                {props.children}
            </PanGestureHandler>
        </Animated.View>
    );
};

export const ScrollViewGesture = IScrollViewGesture;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    contentVertical: {
        flexDirection: 'column',
    },
    contentHorizontal: {
        flexDirection: 'row',
    },
});
