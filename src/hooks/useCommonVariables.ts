import React from "react";
import type Animated from "react-native-reanimated";
import { useSharedValue, useAnimatedReaction } from "react-native-reanimated";

import { computeNewIndexWhenDataChanges } from "./computeNewIndexWhenDataChanges";
import type { TInitializeCarouselProps } from "./useInitProps";

import { handlerOffsetDirection } from "../utils/handlerOffsetDirection";

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
    data,
    defaultIndex,
    defaultScrollOffsetValue,
    loop,
  } = props;
  const size = vertical ? height : width;
  const validLength = data.length - 1;
  const defaultHandlerOffsetValue = -Math.abs(defaultIndex * size);
  const _handlerOffset = useSharedValue<number>(defaultHandlerOffsetValue);
  const handlerOffset = defaultScrollOffsetValue ?? _handlerOffset;
  const prevDataLength = useSharedValue(data.length);

  React.useEffect(() => {
    handlerOffset.value = defaultHandlerOffsetValue;
  }, [vertical, handlerOffset, defaultHandlerOffsetValue]);

  useAnimatedReaction(() => {
    const previousLength = prevDataLength.value;
    const currentLength = data.length;
    const isLengthChanged = previousLength !== currentLength;
    const shouldComputed = isLengthChanged && loop;

    if (shouldComputed)
      prevDataLength.value = data.length;

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
  }, [data, loop]);

  return {
    size,
    validLength,
    handlerOffset,
  };
}
