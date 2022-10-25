export function computeNewIndexWhenDataChanges(params: {
  direction: number
  handlerOffset: number
  size: number
  previousLength: number
  currentLength: number
}) {
  "worklet";
  const { direction, handlerOffset: _handlerOffset, size, previousLength, currentLength } = params;

  let handlerOffset = _handlerOffset;
  let positionIndex;
  let round;

  const isPositive = direction < 0;

  if (isPositive) {
    positionIndex = (Math.abs(handlerOffset)) / size;
    round = parseInt(String(positionIndex / previousLength));
  }
  else {
    positionIndex = (Math.abs(handlerOffset) - size) / size;
    round = parseInt(String(positionIndex / previousLength)) + 1;
  }

  const prevIndex = isPositive ? (positionIndex) % previousLength : previousLength - (positionIndex) % previousLength - 1;
  const changedLength = round * (currentLength - previousLength);
  const changedOffset = changedLength * size;
  if (prevIndex > currentLength - 1 && currentLength < previousLength) {
    if (isPositive)
      handlerOffset = (currentLength - 1) * size * direction;

    else
      handlerOffset = (currentLength - 1) * size * -1;
  }
  else {
    handlerOffset += changedOffset * direction;
  }

  return handlerOffset;
}

