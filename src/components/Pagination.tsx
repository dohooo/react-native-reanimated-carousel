import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
} from 'react-native-reanimated';

type PaginationProps = {
    length: number;
    style?: StyleProp<ViewStyle>;
    progressValue?: Animated.AnimationState;
    inactiveColor?: string;
    activeColor?: string;
    dotSize?: number;
    inactiveScaleSize?: number;
    activeScaleSize?: number;
    dotStyle?: StyleProp<ViewStyle>;
    inactiveOpacity?: number;
    activeOpacity?: number;
    activeIndex?: number;
};

const Pagination = ({
    length,
    style,
    progressValue,
    inactiveColor = '#707070',
    activeColor = '#707070',
    dotSize = 6,
    inactiveScaleSize = 0.8,
    activeScaleSize = 1,
    dotStyle,
    inactiveOpacity = 0.5,
    activeOpacity = 1,
    activeIndex,
}: PaginationProps) => {
    const dataLength = useMemo(() => [...Array(length).keys()], [length]);

    const renderItem = (item:any, index:number) => {
        return (
            <PaginationItem
                animValue={progressValue}
                index={index}
                key={index}
                length={length}
                inactiveColor={inactiveColor}
                activeColor={activeColor}
                dotStyle={dotStyle}
                dotSize={dotSize}
                inactiveScaleSize={inactiveScaleSize}
                activeScaleSize={activeScaleSize}
                inactiveOpacity={inactiveOpacity}
                activeOpacity={activeOpacity}
                activeIndex={activeIndex}
            />
        );
    };

    return (
        <View pointerEvents={'box-none'} style={[styles.wrapDot, style]}>
            {dataLength.map(renderItem)}
        </View>
    );
};

type PaginationItemProps = {
    animValue?: Animated.AnimationState;
    inactiveColor?: string;
    activeColor?: string;
    dotSize?: number;
    inactiveScaleSize?: number;
    activeScaleSize?: number;
    dotStyle?: StyleProp<ViewStyle>;
    inactiveOpacity?: number;
    activeOpacity?: number;
    activeIndex?: number;
    index: number;
    length: number;
    key: number
}

const PaginationItem = ({
    animValue,
    index,
    length,
    inactiveColor,
    activeColor,
    dotStyle,
    dotSize = 6,
    inactiveScaleSize,
    activeScaleSize,
    inactiveOpacity,
    activeOpacity,
    activeIndex,
}: PaginationItemProps) => {
    const animStyle = useAnimatedStyle(() => {
        if (typeof activeIndex === 'number') {
            return {};
        }
        let inputRange = [index - 1, index, index + 1];
        let outputRange = [inactiveOpacity, activeOpacity, inactiveOpacity];

        if (index === 0 && animValue?.value > length - 1) {
            inputRange = [length - 1, length, length + 1];
            outputRange = [inactiveOpacity, activeOpacity, inactiveOpacity];
        }

        return {
            opacity: interpolate(
                animValue?.value,
                inputRange,
                outputRange,
                Extrapolate.CLAMP,
            ),
            backgroundColor: interpolateColor(animValue?.value, inputRange, [
                'transparent',
                activeColor,
                'transparent',
            ]),
            borderColor: interpolateColor(animValue?.value, inputRange, [
                inactiveColor,
                'transparent',
                inactiveColor,
            ]),
            transform: [
                {
                    scale: interpolate(animValue?.value, inputRange, [
                        inactiveScaleSize,
                        activeScaleSize,
                        inactiveScaleSize,
                    ]),
                },
            ],
        };
    }, [animValue, index, length]);

    const getStyle = useCallback(() => {
        if (typeof activeIndex === 'number') {
            if (index === activeIndex) {
                return {
                    backgroundColor: activeColor,
                    transform: [{ scale: activeScaleSize }],
                    opacity: activeOpacity,
                    borderColor: 'transparent',
                };
            }

            return {
                backgroundColor: 'transparent',
                transform: [{ scale: inactiveScaleSize }],
                opacity: inactiveScaleSize,
                borderColor: inactiveColor,
            };
        }
        return null;
    }, [activeIndex]);

    return (
        <Animated.View
            style={[
                styles.dot,
                { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
                dotStyle,
                animStyle,
                getStyle(),
            ]}
        />
    );
};

export default Pagination;

const styles = StyleSheet.create({
    wrapDot: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        borderWidth: 1,
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
});
