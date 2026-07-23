export function positiveModulo(value: number, divisor: number): number {
  "worklet";

  if (!Number.isFinite(value) || !Number.isFinite(divisor) || divisor <= 0) return 0;

  const remainder = value % divisor;
  return remainder < 0 ? remainder + divisor : remainder;
}

export function getLogicalProgress(offset: number, itemSize: number): number {
  "worklet";

  if (!Number.isFinite(offset) || !Number.isFinite(itemSize) || itemSize <= 0) return 0;
  return -offset / itemSize;
}

export function getOffsetForLogicalPage(page: number, itemSize: number): number {
  "worklet";

  if (!Number.isFinite(page) || !Number.isFinite(itemSize) || itemSize <= 0) return 0;
  if (page === 0) return 0;
  return -page * itemSize;
}

export function getNearestLogicalPage(offset: number, itemSize: number): number {
  "worklet";

  return Math.round(getLogicalProgress(offset, itemSize));
}

export function getSettledRawIndex(progress: number, count: number): number {
  "worklet";

  if (!Number.isFinite(count) || count <= 0) return 0;
  return positiveModulo(Math.round(progress), Math.floor(count));
}

export function getNearestLoopPosition(rawIndex: number, progress: number, count: number): number {
  "worklet";

  if (
    !Number.isFinite(rawIndex) ||
    !Number.isFinite(progress) ||
    !Number.isFinite(count) ||
    count <= 0
  ) {
    return 0;
  }

  const safeCount = Math.floor(count);
  const normalizedIndex = positiveModulo(Math.round(rawIndex), safeCount);
  const lowerCycle = Math.floor((progress - normalizedIndex) / safeCount);
  const lower = normalizedIndex + lowerCycle * safeCount;
  const upper = lower + safeCount;
  const lowerDistance = Math.abs(progress - lower);
  const upperDistance = Math.abs(upper - progress);

  if (upperDistance < lowerDistance) return upper;
  if (lowerDistance < upperDistance) return lower;

  // An exact tie resolves in the logical forward direction.
  return upper >= progress ? upper : lower;
}

export function getRelativeProgress(params: {
  rawIndex: number;
  progress: number;
  count: number;
  loop: boolean;
}): number {
  "worklet";

  const { rawIndex, progress, count, loop } = params;
  if (!Number.isFinite(progress)) return 0;

  const itemPosition = loop ? getNearestLoopPosition(rawIndex, progress, count) : rawIndex;
  return itemPosition - progress;
}

export function getBoundedLoopOffset(offset: number, itemSize: number, count: number): number {
  "worklet";

  if (
    !Number.isFinite(offset) ||
    !Number.isFinite(itemSize) ||
    !Number.isFinite(count) ||
    itemSize <= 0 ||
    count <= 0
  ) {
    return 0;
  }

  const cycleSize = itemSize * Math.floor(count);
  return offset % cycleSize;
}

export function getShortestLoopTargetPage(params: {
  currentPage: number;
  targetIndex: number;
  count: number;
}): number {
  "worklet";

  const { currentPage, targetIndex, count } = params;
  if (
    !Number.isFinite(currentPage) ||
    !Number.isInteger(targetIndex) ||
    !Number.isInteger(count) ||
    count <= 0
  ) {
    return 0;
  }

  const currentRawIndex = positiveModulo(currentPage, count);
  const forwardDistance = positiveModulo(targetIndex - currentRawIndex, count);
  const backwardDistance = forwardDistance - count;
  const distance =
    Math.abs(forwardDistance) <= Math.abs(backwardDistance) ? forwardDistance : backwardDistance;

  return currentPage + distance;
}

export function reconcileOffsetAfterDataChange(params: {
  offset: number;
  itemSize: number;
  previousCount: number;
  nextCount: number;
  defaultIndex: number;
  loop: boolean;
  retainedIndex?: number;
}): number {
  "worklet";

  const { offset, itemSize, previousCount, nextCount, defaultIndex, loop, retainedIndex } = params;
  if (!Number.isInteger(nextCount) || nextCount <= 0 || itemSize <= 0) return 0;

  if (!Number.isInteger(previousCount) || previousCount <= 0) {
    const initialIndex = Math.max(0, Math.min(nextCount - 1, defaultIndex));
    return getOffsetForLogicalPage(initialIndex, itemSize);
  }

  const currentPage = getNearestLogicalPage(offset, itemSize);
  const previousRawIndex = positiveModulo(currentPage, previousCount);
  const nextRawIndex =
    typeof retainedIndex === "number" &&
    Number.isInteger(retainedIndex) &&
    retainedIndex >= 0 &&
    retainedIndex < nextCount
      ? retainedIndex
      : Math.min(previousRawIndex, nextCount - 1);
  const nextPage = loop
    ? getNearestLoopPosition(nextRawIndex, currentPage, nextCount)
    : nextRawIndex;

  return getOffsetForLogicalPage(nextPage, itemSize);
}
