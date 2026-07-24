import {
  getBoundedLoopOffset,
  getLogicalProgress,
  getNearestLogicalPage,
  getNearestLoopPosition,
  getOffsetForLogicalPage,
  getRelativeProgress,
  getSettledRawIndex,
  getShortestLoopTargetPage,
  positiveModulo,
  reconcileOffsetAfterDataChange,
} from "./carousel-math";

describe("carousel logical-coordinate math", () => {
  it("keeps forward movement negative in offset space and positive in progress space", () => {
    expect(getOffsetForLogicalPage(3, 320)).toBe(-960);
    expect(getLogicalProgress(-960, 320)).toBe(3);
    expect(getNearestLogicalPage(-1000, 320)).toBe(3);
  });

  it("uses positive modulo for raw indexes", () => {
    expect(positiveModulo(-1, 5)).toBe(4);
    expect(getSettledRawIndex(-1, 5)).toBe(4);
    expect(getSettledRawIndex(6, 5)).toBe(1);
    expect(getSettledRawIndex(Number.NaN, 0)).toBe(0);
  });

  it("selects the nearest loop copy and resolves an exact tie forward", () => {
    expect(getNearestLoopPosition(0, 4.8, 5)).toBe(5);
    expect(getNearestLoopPosition(4, 5.2, 5)).toBe(4);
    expect(getNearestLoopPosition(0, 2.5, 5)).toBe(5);

    expect(getRelativeProgress({ rawIndex: 0, progress: 4.8, count: 5, loop: true })).toBeCloseTo(
      0.2
    );
    expect(getRelativeProgress({ rawIndex: 4, progress: 4.8, count: 5, loop: true })).toBeCloseTo(
      -0.8
    );
  });

  it("chooses the shortest scrollTo route and resolves a tie forward", () => {
    expect(getShortestLoopTargetPage({ currentPage: 4, targetIndex: 1, count: 5 })).toBe(6);
    expect(getShortestLoopTargetPage({ currentPage: 1, targetIndex: 4, count: 5 })).toBe(-1);
    expect(getShortestLoopTargetPage({ currentPage: 0, targetIndex: 2, count: 4 })).toBe(2);
  });

  it("keeps view-facing translations bounded during a long-running loop", () => {
    const itemSize = 390;
    const count = 7;
    const progress = 10_000_000.375;
    const offset = getOffsetForLogicalPage(progress, itemSize);
    const boundedOffset = getBoundedLoopOffset(offset, itemSize, count);

    expect(getLogicalProgress(offset, itemSize)).toBe(progress);
    expect(Math.abs(boundedOffset)).toBeLessThan(itemSize * count);
    expect(getSettledRawIndex(progress, count)).toBe(3);

    const distances = Array.from({ length: count }, (_, rawIndex) =>
      Math.abs(getRelativeProgress({ rawIndex, progress, count, loop: true }))
    );
    expect(Math.min(...distances)).toBeCloseTo(0.375);
    expect(distances.every(Number.isFinite)).toBe(true);
  });

  it("reconciles empty, shrinking, and looped data without invalid offsets", () => {
    expect(
      reconcileOffsetAfterDataChange({
        offset: -640,
        itemSize: 320,
        previousCount: 4,
        nextCount: 0,
        defaultIndex: 0,
        loop: false,
      })
    ).toBe(0);

    expect(
      reconcileOffsetAfterDataChange({
        offset: -960,
        itemSize: 320,
        previousCount: 5,
        nextCount: 2,
        defaultIndex: 0,
        loop: false,
      })
    ).toBe(-320);

    expect(
      reconcileOffsetAfterDataChange({
        offset: getOffsetForLogicalPage(9, 320),
        itemSize: 320,
        previousCount: 5,
        nextCount: 3,
        defaultIndex: 0,
        loop: true,
      })
    ).toBe(getOffsetForLogicalPage(8, 320));

    expect(
      reconcileOffsetAfterDataChange({
        offset: 0,
        itemSize: 320,
        previousCount: 0,
        nextCount: 5,
        defaultIndex: 3,
        loop: false,
      })
    ).toBe(-960);
  });

  it("reconciles to a retained keyed item index", () => {
    expect(
      reconcileOffsetAfterDataChange({
        offset: -320,
        itemSize: 320,
        previousCount: 3,
        nextCount: 4,
        defaultIndex: 0,
        loop: false,
        retainedIndex: 2,
      })
    ).toBe(-640);

    expect(
      reconcileOffsetAfterDataChange({
        offset: getOffsetForLogicalPage(9, 320),
        itemSize: 320,
        previousCount: 4,
        nextCount: 3,
        defaultIndex: 0,
        loop: true,
        retainedIndex: 1,
      })
    ).toBe(getOffsetForLogicalPage(10, 320));
  });

  it.each([
    [Number.NaN, 320],
    [Number.POSITIVE_INFINITY, 320],
    [100, 0],
    [100, -1],
  ])("returns neutral values for invalid offset inputs", (offset, itemSize) => {
    expect(getLogicalProgress(offset, itemSize)).toBe(0);
    expect(getNearestLogicalPage(offset, itemSize)).toBe(0);
  });
});
