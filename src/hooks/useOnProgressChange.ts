import Animated, {
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { computedOffsetXValueWithAutoFillData } from '../utils/computedWithAutoFillData';
import type { TCarouselProps } from '../types';

export function useOnProgressChange(
    opts: {
        size: number;
        autoFillData: boolean;
        loop: boolean;
        offsetX: Animated.SharedValue<number>;
        rawData: TCarouselProps['data'];
    } & Pick<TCarouselProps, 'onProgressChange'>
) {
    const { autoFillData, loop, offsetX, rawData, size, onProgressChange } =
        opts;

    const rawDataLength = rawData.length;

    useAnimatedReaction(
        () => offsetX.value,
        (_value) => {
            let value = computedOffsetXValueWithAutoFillData({
                value: _value,
                rawDataLength,
                size,
                autoFillData,
                loop,
            });

            if (!loop) {
                value = Math.max(
                    -((rawDataLength - 1) * size),
                    Math.min(value, 0)
                );
            }

            let absoluteProgress = Math.abs(value / size);

            if (value > 0) {
                absoluteProgress = rawDataLength - absoluteProgress;
            }

            !!onProgressChange &&
                runOnJS(onProgressChange)(value, absoluteProgress);
        },
        [loop, autoFillData, rawDataLength, onProgressChange]
    );
}
