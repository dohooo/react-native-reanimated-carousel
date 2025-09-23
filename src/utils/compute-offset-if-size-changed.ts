export function computeOffsetIfSizeChanged(params: {
  handlerOffset: number;
  prevSize: number;
  size: number;
}) {
  "worklet";
  const { handlerOffset, prevSize, size } = params;

  if (!prevSize) {
    return handlerOffset;
  }

  return (handlerOffset / prevSize) * size;
}
