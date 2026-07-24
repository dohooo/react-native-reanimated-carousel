import React from "react";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { InitializedCarouselProps } from "./useInitProps";

import {
  getNearestLogicalPage,
  positiveModulo,
  reconcileOffsetAfterDataChange,
} from "../utils/carousel-math";
import { computeOffsetIfSizeChanged } from "../utils/compute-offset-if-size-changed";

export type CarouselSizePhase = "pending" | "ready" | "updating";

export interface CarouselCommonVariables {
  size: number;
  validLength: number;
  handlerOffset: SharedValue<number>;
  resolvedSize: SharedValue<number | null>;
  sizePhase: SharedValue<CarouselSizePhase>;
  sizeExplicit: boolean;
  isMoving: SharedValue<boolean>;
  dataRevision: number;
  startMovement: () => void;
  cancelMovement: () => void;
  settleMovement: () => void;
}

export function useCommonVariables(
  props: InitializedCarouselProps<unknown>
): CarouselCommonVariables {
  const {
    orientation,
    style,
    dataLength,
    defaultIndex,
    keyExtractor,
    loop,
    itemSize,
    rawData,
    rawDataLength,
  } = props;
  const isVertical = orientation === "vertical";

  const manualSize = React.useMemo(() => {
    if (typeof itemSize === "number" && itemSize > 0) {
      return itemSize;
    }

    const { width, height } = StyleSheet.flatten(style) || {};
    const candidate = isVertical ? height : width;
    if (typeof candidate === "number" && candidate > 0) {
      return candidate;
    }

    return null;
  }, [isVertical, itemSize, style]);

  const resolvedSize = useSharedValue<number | null>(manualSize);
  const sizePhase = useSharedValue<CarouselSizePhase>(manualSize ? "ready" : "pending");

  const defaultHandlerOffsetValue =
    manualSize && dataLength > 0 ? -Math.abs(defaultIndex * manualSize) : 0;
  const _handlerOffset = useSharedValue<number>(defaultHandlerOffsetValue);
  const handlerOffset = props.scrollOffsetValue ?? _handlerOffset;
  const prevDataLength = useSharedValue(rawDataLength);
  const previousRawData = React.useRef(rawData);
  const previousKeyExtractor = React.useRef(keyExtractor);
  const isMoving = useSharedValue(false);
  const pendingDataChange = useSharedValue<{
    previousLength: number;
    currentLength: number;
    retainedIndex: number | null;
  } | null>(null);
  // Start at zero even when a synchronous item size is available. The first
  // size reaction owns initialization and must write the default-index offset
  // into consumer-provided SharedValues as well as the internal value.
  const prevSize = useSharedValue(0);
  const hasInitializedOffset = useSharedValue(false);
  const sizeExplicit = typeof itemSize === "number" && itemSize > 0;

  const [size, setSize] = React.useState<number>(manualSize ?? 0);
  const [dataRevision, setDataRevision] = React.useState(0);

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

  React.useEffect(() => {
    const currentSize = resolvedSize.value ?? 0;
    if (currentSize <= 0 || dataLength <= 0 || hasInitializedOffset.value) return;

    handlerOffset.value = -(defaultIndex * currentSize);
    prevSize.value = currentSize;
    hasInitializedOffset.value = true;
  }, [dataLength, defaultIndex, handlerOffset, hasInitializedOffset, prevSize, resolvedSize]);

  const reconcileDataChange = React.useCallback(
    (previousLength: number, currentLength: number, retainedIndex?: number) => {
      const currentSize = resolvedSize.value ?? 0;
      if (currentSize <= 0) return;

      handlerOffset.value = reconcileOffsetAfterDataChange({
        offset: handlerOffset.value,
        itemSize: currentSize,
        previousCount: previousLength,
        nextCount: currentLength,
        defaultIndex,
        loop,
        retainedIndex,
      });
      setDataRevision((revision) => revision + 1);
    },
    [defaultIndex, handlerOffset, loop, resolvedSize]
  );

  const startMovement = React.useCallback(() => {
    isMoving.value = true;
  }, [isMoving]);

  const finishMovement = React.useCallback(() => {
    isMoving.value = false;
    const pending = pendingDataChange.value;
    if (!pending) return;

    pendingDataChange.value = null;
    reconcileDataChange(
      pending.previousLength,
      pending.currentLength,
      pending.retainedIndex ?? undefined
    );
  }, [isMoving, pendingDataChange, reconcileDataChange]);

  /**
   * When data changes, we need to compute new index for handlerOffset
   */
  React.useEffect(() => {
    const previousLength = prevDataLength.value;
    const previousItems = previousRawData.current;
    const dataChanged =
      previousLength !== rawDataLength ||
      previousItems.length !== rawData.length ||
      previousItems.some((item, index) => !Object.is(item, rawData[index]));

    previousRawData.current = rawData;
    const extractorForPreviousData = previousKeyExtractor.current ?? keyExtractor;
    previousKeyExtractor.current = keyExtractor;

    if (!dataChanged) return;

    let retainedIndex: number | undefined;
    if (keyExtractor && extractorForPreviousData && previousLength > 0 && rawDataLength > 0) {
      const currentSize = resolvedSize.value ?? 0;
      const pendingIndex = pendingDataChange.value?.retainedIndex;
      const previousIndex =
        typeof pendingIndex === "number"
          ? pendingIndex
          : positiveModulo(getNearestLogicalPage(handlerOffset.value, currentSize), previousLength);
      if (previousIndex < previousItems.length) {
        const selectedKey = extractorForPreviousData(previousItems[previousIndex], previousIndex);
        const matchingIndex = rawData.findIndex(
          (item, index) => keyExtractor(item, index) === selectedKey
        );
        if (matchingIndex >= 0) retainedIndex = matchingIndex;
      }
    }

    prevDataLength.value = rawDataLength;
    if (isMoving.value) {
      pendingDataChange.value = {
        previousLength: pendingDataChange.value?.previousLength ?? previousLength,
        currentLength: rawDataLength,
        retainedIndex: retainedIndex ?? null,
      };
      return;
    }

    reconcileDataChange(previousLength, rawDataLength, retainedIndex);
  }, [
    handlerOffset,
    isMoving,
    keyExtractor,
    pendingDataChange,
    prevDataLength,
    rawData,
    rawDataLength,
    reconcileDataChange,
    resolvedSize,
  ]);

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

      if (dataLength <= 0) {
        prevSize.value = currentSize;
        sizePhase.value = "ready";
        return;
      }

      if (previousSize <= 0 || !hasInitializedOffset.value) {
        handlerOffset.value = -(defaultIndex * currentSize);
        hasInitializedOffset.value = true;
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
    [dataLength, defaultIndex, hasInitializedOffset, resolvedSize, sizePhase]
  );

  return {
    size,
    validLength: dataLength - 1,
    handlerOffset,
    resolvedSize,
    sizePhase,
    sizeExplicit,
    isMoving,
    dataRevision,
    startMovement,
    cancelMovement: finishMovement,
    settleMovement: finishMovement,
  };
}
