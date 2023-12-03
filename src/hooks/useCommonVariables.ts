import type Animated from "react-native-reanimated";
import { useSharedValue, useAnimatedReaction } from "react-native-reanimated";

import type { TInitializeCarouselProps } from "./useInitProps";

import { computeNewIndexWhenDataChanges } from "../utils/computeNewIndexWhenDataChanges";
import { handlerOffsetDirection } from "../utils/handleroffset-direction";

interface ICommonVariables {
  size: number
  validLength: number
  handlerOffset: Animated.SharedValue<number>
}

export function useCommonVariables(
  props: TInitializeCarouselProps<any>,
): ICommonVariables {
  const {
    vertical,
    height,
    width,
    dataLength,
    defaultIndex,
    defaultScrollOffsetValue,
    loop,
  } = props;
  const size = vertical ? height : width;
  const defaultHandlerOffsetValue = -Math.abs(defaultIndex * size);
  const _handlerOffset = useSharedValue<number>(defaultHandlerOffsetValue);
  const handlerOffset = defaultScrollOffsetValue ?? _handlerOffset;
  const prevDataLength = useSharedValue(dataLength);

  /**
   * When data changes, we need to compute new index for handlerOffset
  */
  useAnimatedReaction(() => {
    const previousLength = prevDataLength.value;
    const currentLength = dataLength;
    const isLengthChanged = previousLength !== currentLength;
    const shouldComputed = isLengthChanged && loop;

    if (shouldComputed)
      prevDataLength.value = dataLength;

    return {
      shouldComputed,
      previousLength,
      currentLength,
    };
  }, ({ shouldComputed, previousLength, currentLength }) => {
    if (shouldComputed) {
      // direction -> 1 | -1
      const direction = handlerOffsetDirection(handlerOffset);

      handlerOffset.value = computeNewIndexWhenDataChanges({
        direction,
        previousLength,
        currentLength,
        size,
        handlerOffset: handlerOffset.value,
      });
    }
  }, [dataLength, loop]);

  return {
    size,
    validLength: dataLength - 1,
    handlerOffset,
  };
}
