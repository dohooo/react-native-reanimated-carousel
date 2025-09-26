import React from "react";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { TInitializeCarouselProps } from "./useInitProps";

import { computeOffsetIfDataChanged } from "../utils/compute-offset-if-data-changed";
import { computeOffsetIfSizeChanged } from "../utils/compute-offset-if-size-changed";
import { handlerOffsetDirection } from "../utils/handleroffset-direction";

export type TCarouselSizePhase = "pending" | "ready" | "updating";

export interface ICommonVariables {
  size: number;
  validLength: number;
  handlerOffset: SharedValue<number>;
  resolvedSize: SharedValue<number | null>;
  sizePhase: SharedValue<TCarouselSizePhase>;
}

export function useCommonVariables(props: TInitializeCarouselProps<any>): ICommonVariables {
  const { vertical, style, dataLength, defaultIndex, defaultScrollOffsetValue, loop } = props;

  const manualSize = React.useMemo(() => {
    const { width, height } = StyleSheet.flatten(style) || {};
    const candidate = vertical ? height : width;
    return typeof candidate === "number" && candidate > 0 ? candidate : null;
  }, [vertical, style]);

  const resolvedSize = useSharedValue<number | null>(manualSize);
  const sizePhase = useSharedValue<TCarouselSizePhase>(manualSize ? "ready" : "pending");

  const defaultHandlerOffsetValue = manualSize ? -Math.abs(defaultIndex * manualSize) : 0;
  const _handlerOffset = useSharedValue<number>(defaultHandlerOffsetValue);
  const handlerOffset = defaultScrollOffsetValue ?? _handlerOffset;
  const prevDataLength = useSharedValue(dataLength);
  const prevSize = useSharedValue(manualSize ?? 0);

  const [size, setSize] = React.useState<number>(manualSize ?? 0);

  const syncSize = React.useCallback((next: number) => {
    setSize((current) => (current === next ? current : next));
  }, []);

  useAnimatedReaction(
    () => resolvedSize.value,
    (current, previous) => {
      if (current == null || current <= 0) return;
      if (current !== previous) {
        scheduleOnRN(syncSize, current);
      }
    },
    [syncSize]
  );

  React.useEffect(() => {
    if (manualSize && manualSize > 0) {
      resolvedSize.value = manualSize;
      sizePhase.value = "ready";
    }
  }, [manualSize, resolvedSize, sizePhase]);

  /**
   * When data changes, we need to compute new index for handlerOffset
   */
  useAnimatedReaction(
    () => {
      const previousLength = prevDataLength.value;
      const currentLength = dataLength;
      const isLengthChanged = previousLength !== currentLength;
      const shouldComputed = isLengthChanged && loop;

      if (shouldComputed) prevDataLength.value = dataLength;

      return {
        shouldComputed,
        previousLength,
        currentLength,
      };
    },
    ({ shouldComputed, previousLength, currentLength }) => {
      if (shouldComputed) {
        // direction -> 1 | -1
        const direction = handlerOffsetDirection(handlerOffset);

        const _size = resolvedSize.value ?? 0;
        if (_size <= 0) return;

        handlerOffset.value = computeOffsetIfDataChanged({
          direction,
          previousLength,
          currentLength,
          size: _size,
          handlerOffset: handlerOffset.value,
        });
      }
    },
    [dataLength, loop, resolvedSize]
  );

  /**
   * When size changes, we need to compute new index for handlerOffset
   */
  useAnimatedReaction(
    () => resolvedSize.value,
    (currentSize) => {
      if (currentSize == null || currentSize <= 0) return;
      const previousSize = prevSize.value;

      if (previousSize === currentSize) return;

      sizePhase.value = previousSize > 0 ? "updating" : sizePhase.value;

      if (previousSize <= 0) {
        handlerOffset.value = -Math.abs(defaultIndex * currentSize);
      } else {
        handlerOffset.value = computeOffsetIfSizeChanged({
          handlerOffset: handlerOffset.value,
          prevSize: previousSize,
          size: currentSize,
        });
      }

      prevSize.value = currentSize;
      sizePhase.value = "ready";
    },
    [defaultIndex, resolvedSize, sizePhase]
  );

  return {
    size,
    validLength: dataLength - 1,
    handlerOffset,
    resolvedSize,
    sizePhase,
  };
}
