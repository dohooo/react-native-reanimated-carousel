export function computeOffsetIfSizeChanged(params: {
  handlerOffset: number;
  prevSize: number;
  size: number;
}) {
  "worklet";
  const { handlerOffset, prevSize, size } = params;

  return (handlerOffset / prevSize) * size;
}
