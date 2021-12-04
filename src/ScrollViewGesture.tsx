import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useAnimatedStyle,
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
    contentContainerStyle?: StyleProp<ViewStyle>;
    horizontal?: boolean;
    infinite?: boolean;
    onScroll?: (offset: Animated.SharedValue<number>) => void;
    offset?: Animated.SharedValue<number>;
    translate?: Animated.SharedValue<number>;
    pagingEnabled?: boolean;
}

const IScrollViewGesture: React.FC<Props> = (props) => {
    const {
        style,
        contentContainerStyle,
        horizontal,
        infinite,
        onScroll,
        offset,
        pagingEnabled,
    } = props;

    const isHorizontal = useDerivedValue(
        () => (horizontal === false ? false : true),
        [horizontal]
    );
    const touching = useSharedValue(false);
    const scrollEndDirection = useSharedValue(0);
    const scrollEndVelocity = useSharedValue(0);

    const cLength = useSharedValue(0);
    const svLength = useSharedValue(0);
    const panOffset = useSharedValue(0);
    const scrollOffset = useDerivedValue(
        () => -panOffset.value,
        [panOffset.value]
    );
    const maxLength = useDerivedValue(
        () => cLength.value - svLength.value,
        [cLength.value, svLength.value]
    );
    const singlePageLength = useSharedValue(0);
    const pageCount = React.Children.count(props.children);

    const endWithSpring = React.useCallback((toValue: number) => {
        'worklet';
        return withSpring(toValue, {
            damping: 100,
        });
    }, []);

    const withPaging = React.useCallback(() => {
        'worklet';
        const page = Math.round(-panOffset.value / svLength.value);
        const velocityPage = Math.round(
            -(panOffset.value + scrollEndVelocity.value) / svLength.value
        );
        const pageWithVelocity = Math.min(
            page + 1,
            Math.max(page - 1, velocityPage)
        );
        const finalPage = Math.min(
            pageCount - 1,
            Math.max(0, pageWithVelocity)
        );
        panOffset.value = endWithSpring(-finalPage * svLength.value);
    }, [
        endWithSpring,
        panOffset,
        scrollEndVelocity.value,
        svLength.value,
        pageCount,
    ]);

    const resetBoundary = React.useCallback(() => {
        'worklet';
        const onFinish = (isFinished: boolean) => {
            if (isFinished) {
                touching.value = false;
            }
        };
        const activeDecay = () => {
            touching.value = true;
            panOffset.value = withDecay(
                { velocity: scrollEndVelocity.value },
                onFinish
            );
        };

        if (touching.value || infinite) {
            return;
        }

        if (scrollOffset.value < 0) {
            if (scrollEndDirection.value < 0) {
                activeDecay();
            } else {
                panOffset.value = endWithSpring(0);
            }
        }

        if (scrollOffset.value > maxLength.value) {
            if (scrollEndDirection.value > 0) {
                activeDecay();
            } else {
                panOffset.value = endWithSpring(-maxLength.value);
            }
        }
    }, [
        infinite,
        touching,
        scrollOffset,
        endWithSpring,
        maxLength.value,
        panOffset,
        scrollEndDirection,
        scrollEndVelocity,
    ]);

    useAnimatedReaction(
        () => scrollOffset.value,
        (v) => {
            if (offset) {
                offset.value = v;
            }
            if (onScroll) {
                runOnJS(onScroll)(scrollOffset);
            }

            if (!pagingEnabled) {
                resetBoundary();
            }
        },
        [maxLength.value, touching.value, scrollOffset, pagingEnabled]
    );

    const panGestureEventHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        GestureContext
    >(
        {
            onStart: (_, ctx) => {
                touching.value = true;
                cancelAnimation(panOffset);
                ctx.max = cLength.value - svLength.value;
                ctx.panOffset = panOffset.value;
            },
            onActive: (e, ctx) => {
                touching.value = true;
                const { translationX, translationY } = e;
                let translate = isHorizontal.value
                    ? translationX
                    : translationY;

                if (panOffset.value > 0 || panOffset.value < -ctx.max) {
                    translate = translate * 0.5;
                }
                panOffset.value = ctx.panOffset + translate;

                if (props.translate) {
                    props.translate.value = translate;
                }
            },
            onEnd: (e) => {
                const { velocityX, velocityY, translationX, translationY } = e;
                scrollEndVelocity.value = isHorizontal.value
                    ? velocityX
                    : velocityY;
                scrollEndDirection.value = isHorizontal.value
                    ? translationX
                    : translationY;

                if (pagingEnabled) {
                    withPaging();
                } else {
                    panOffset.value = withDecay({
                        velocity: scrollEndVelocity.value,
                    });
                }

                if (!infinite) {
                    touching.value = false;
                }
            },
        },
        [pagingEnabled, isHorizontal.value, infinite]
    );

    const animatedStyle = useAnimatedStyle(() => {
        if (isHorizontal.value) {
            return {
                transform: [{ translateX: panOffset.value }],
            };
        }
        return {
            transform: [{ translateY: panOffset.value }],
        };
    }, [isHorizontal.value]);

    const directionStyle = React.useMemo(() => {
        return horizontal ? styles.contentHorizontal : styles.contentVertical;
    }, [horizontal]);

    return (
        <Animated.View style={[styles.container, directionStyle]}>
            <PanGestureHandler onGestureEvent={panGestureEventHandler}>
                <Animated.View
                    style={[style, styles.container, directionStyle]}
                    onLayout={(e) => {
                        const { width, height } = e.nativeEvent.layout;
                        const len = horizontal ? width : height;
                        svLength.value = len;
                    }}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            contentContainerStyle,
                            animatedStyle,
                            directionStyle,
                        ]}
                        onLayout={(e) => {
                            const { width, height } = e.nativeEvent.layout;
                            const len = horizontal ? width : height;
                            cLength.value = len;
                            singlePageLength.value =
                                len / React.Children.count(props.children);
                        }}
                    >
                        {props.children}
                    </Animated.View>
                </Animated.View>
            </PanGestureHandler>
        </Animated.View>
    );
};

export const ScrollViewGesture = IScrollViewGesture;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    content: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    contentVertical: {
        flexDirection: 'column',
    },
    contentHorizontal: {
        flexDirection: 'row',
    },
});
