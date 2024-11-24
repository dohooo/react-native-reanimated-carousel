export function omitZero(a: number, b: number) {
  "worklet";
  if (a === 0) return 0;

  return b;
}

export function computeOffsetIfDataChanged(params: {
  direction: number;
  handlerOffset: number;
  size: number;
  previousLength: number;
  currentLength: number;
}) {
  "worklet";
  const { direction, handlerOffset: _handlerOffset, size, previousLength, currentLength } = params;

  let handlerOffset = _handlerOffset;
  let positionIndex: number;
  let round: number;

  const isPositive = direction < 0;

  if (isPositive) {
    positionIndex = Math.abs(handlerOffset) / size;
    round = Number.parseInt(String(omitZero(previousLength, positionIndex / previousLength)));
  } else {
    positionIndex = (Math.abs(handlerOffset) - size) / size;
    round = Number.parseInt(String(omitZero(previousLength, positionIndex / previousLength))) + 1;
  }

  const prevOffset = omitZero(previousLength, positionIndex % previousLength);
  const prevIndex = isPositive ? prevOffset : previousLength - prevOffset - 1;
  const changedLength = round * (currentLength - previousLength);
  const changedOffset = changedLength * size;
  if (prevIndex > currentLength - 1 && currentLength < previousLength) {
    if (isPositive) handlerOffset = (currentLength - 1) * size * direction;
    else handlerOffset = (currentLength - 1) * size * -1;
  } else {
    handlerOffset += changedOffset * direction;
  }

  return handlerOffset;
}
