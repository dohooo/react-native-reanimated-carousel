export interface IComputedAnimResult {
    MAX: number;
    MIN: number;
    TOTAL_WIDTH: number;
    HALF_WIDTH: number;
}

export function useComputedAnim(
    width: number,
    ITEM_LENGTH: number
): IComputedAnimResult {
    const MAX = (ITEM_LENGTH - 2) * width;
    const MIN = -MAX;
    const TOTAL_WIDTH = width * ITEM_LENGTH;
    const HALF_WIDTH = 0.5 * width;

    return {
        MAX,
        MIN,
        TOTAL_WIDTH,
        HALF_WIDTH,
    };
}
