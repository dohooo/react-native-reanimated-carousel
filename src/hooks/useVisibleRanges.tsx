import type Animated from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';

export type IVisibleRanges = Animated.SharedValue<{
    negativeRange: number[];
    positiveRange: number[];
}>;

export function useVisibleRanges(options: {
    total: number;
    viewSize: number;
    positiveCount?: number;
    negativeCount?: number;
    translation: Animated.SharedValue<number>;
}): IVisibleRanges {
    const {
        total,
        viewSize,
        positiveCount = 1,
        negativeCount = 1,
        translation,
    } = options;

    const ranges = useDerivedValue(() => {
        let curIndex = Math.round(-translation.value / viewSize);
        curIndex = curIndex < 0 ? (curIndex % total) + total : curIndex;
        const negativeRange = [
            (curIndex - negativeCount + total) % total,
            (curIndex - 1 + total) % total,
        ];
        const positiveRange = [
            (curIndex + total) % total,
            (curIndex + positiveCount + total) % total,
        ];
        if (negativeRange[0] < total && negativeRange[0] > negativeRange[1]) {
            negativeRange[1] = total - 1;
            positiveRange[0] = 0;
        }
        if (positiveRange[0] > positiveRange[1]) {
            negativeRange[1] = total - 1;
            positiveRange[0] = 0;
        }
        return { negativeRange, positiveRange };
    }, [positiveCount, positiveCount, total, translation]);

    return ranges;
}
