export type CarouselDirectionSign = -1 | 1;

export function getCarouselDirectionSign(options: {
  isRTL: boolean;
  orientation: "horizontal" | "vertical";
}): CarouselDirectionSign {
  "worklet";

  return options.orientation === "horizontal" && options.isRTL ? -1 : 1;
}

export function toLogicalGestureValue(
  physicalValue: number,
  directionSign: CarouselDirectionSign
): number {
  "worklet";

  return physicalValue * directionSign;
}

export function toPhysicalHorizontalValue(
  logicalValue: number,
  directionSign: CarouselDirectionSign
): number {
  "worklet";

  return logicalValue * directionSign;
}

export function getHorizontalStackOffsetType(
  exitDirection: "left" | "right",
  directionSign: CarouselDirectionSign
): "positive" | "negative" {
  "worklet";

  const ltrType = exitDirection === "right" ? "negative" : "positive";
  if (directionSign === 1) return ltrType;
  return ltrType === "positive" ? "negative" : "positive";
}
