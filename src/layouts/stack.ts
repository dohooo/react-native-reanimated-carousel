import { Dimensions } from 'react-native';
import { Extrapolate, interpolate } from 'react-native-reanimated';

const screen = Dimensions.get('window');

export type StackAnimationConfig = {
    moveSize?: number;
    stackInterval?: number;
    scaleInterval?: number;
    opacityInterval?: number;
    rotateZDeg?: number;
    snapDirection?: 'left' | 'right';
};

export function horizontalStackLayout(opts: {
    size: number;
    showLength: number;
    animationConfig?: StackAnimationConfig;
}) {
    const { showLength, animationConfig = {} } = opts;
    return (value: number) => {
        'worklet';

        const {
            snapDirection = 'left',
            moveSize = screen.width,
            stackInterval = 18,
            scaleInterval = 0.04,
            opacityInterval = 0.1,
            rotateZDeg = 30,
        } = animationConfig;

        const easeInOutCubic = (v: number) => {
            return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
        };
        const getRange = (
            range: number[],
            sign: 'plus' | 'minus' = 'minus'
        ) => {
            if (snapDirection === 'right') {
                const d = sign === 'plus' ? 1 : -1;
                return range.reverse().map((r) => r * d);
            }
            return range;
        };
        const page = Math.floor(Math.abs(value));
        const diff = Math.abs(value) % 1;
        value =
            value < 0
                ? -(page + easeInOutCubic(diff))
                : page + easeInOutCubic(diff);

        const VALID_LENGTH = showLength - 1;

        const inputRange = getRange([-1, 0, VALID_LENGTH]);

        const translateX = interpolate(
            value,
            inputRange,
            getRange([-moveSize, 0, VALID_LENGTH * stackInterval]),
            Extrapolate.CLAMP
        );
        const scale = interpolate(
            value,
            inputRange,
            getRange([1, 1, 1 - VALID_LENGTH * scaleInterval], 'plus'),
            Extrapolate.CLAMP
        );
        const rotateZ = `${interpolate(
            value,
            inputRange,
            getRange([-rotateZDeg, 0, 0]),
            Extrapolate.CLAMP
        )}deg`;
        const zIndex = interpolate(
            value,
            getRange([-1.5, -1, -1 + Number.MIN_VALUE, 0, VALID_LENGTH]),
            getRange(
                [
                    Number.MIN_VALUE,
                    VALID_LENGTH,
                    VALID_LENGTH,
                    VALID_LENGTH - 1,
                    -1,
                ],
                'plus'
            )
        );
        const opacity = interpolate(
            value,
            inputRange,
            getRange([0.25, 1, 1 - VALID_LENGTH * opacityInterval], 'plus')
        );

        return {
            transform: [{ translateX }, { scale }, { rotateZ }],
            zIndex: Math.floor(zIndex * 1000) / 100,
            opacity,
        };
    };
}

export function verticalStackLayout(opts: {
    size: number;
    showLength: number;
    animationConfig?: StackAnimationConfig;
}) {
    const { showLength, animationConfig = {} } = opts;
    return (value: number) => {
        'worklet';

        const {
            snapDirection = 'left',
            moveSize = screen.width,
            stackInterval = 8,
            scaleInterval = 0.04,
            opacityInterval = 0.1,
            rotateZDeg = 30,
        } = animationConfig;

        const easeInOutCubic = (v: number) => {
            return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
        };
        const getRange = (
            range: number[],
            sign: 'plus' | 'minus' = 'minus'
        ) => {
            if (snapDirection === 'right') {
                const d = sign === 'plus' ? 1 : -1;
                return range.reverse().map((r) => r * d);
            }
            return range;
        };
        const page = Math.floor(Math.abs(value));
        const diff = Math.abs(value) % 1;
        value =
            value < 0
                ? -(page + easeInOutCubic(diff))
                : page + easeInOutCubic(diff);

        const VALID_LENGTH = showLength - 1;

        const inputRange = getRange([-1, 0, VALID_LENGTH]);

        const translateX = interpolate(
            value,
            inputRange,
            getRange([-moveSize, 0, 0]),
            Extrapolate.CLAMP
        );
        const scale = interpolate(
            value,
            inputRange,
            getRange([1, 1, 1 - VALID_LENGTH * scaleInterval], 'plus'),
            Extrapolate.CLAMP
        );
        const rotateZ = `${interpolate(
            value,
            inputRange,
            getRange([-rotateZDeg, 0, 0]),
            Extrapolate.CLAMP
        )}deg`;
        const translateY = interpolate(
            value,
            inputRange,
            getRange([0, 0, VALID_LENGTH * stackInterval], 'plus'),
            Extrapolate.CLAMP
        );
        const zIndex = interpolate(
            value,
            getRange([-1.5, -1, -1 + Number.MIN_VALUE, 0, VALID_LENGTH]),
            getRange(
                [
                    Number.MIN_VALUE,
                    VALID_LENGTH,
                    VALID_LENGTH,
                    VALID_LENGTH - 1,
                    -1,
                ],
                'plus'
            )
        );
        const opacity = interpolate(
            value,
            getRange([-1, 0, VALID_LENGTH - 1, VALID_LENGTH]),
            getRange(
                [0.25, 1, 1 - (VALID_LENGTH - 1) * opacityInterval, 0.1],
                'plus'
            )
        );

        return {
            transform: [{ translateX }, { translateY }, { scale }, { rotateZ }],
            zIndex,
            opacity,
        };
    };
}
