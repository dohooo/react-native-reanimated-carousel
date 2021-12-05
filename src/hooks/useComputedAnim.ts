export interface IComputedAnimResult {
    MAX: number;
    MIN: number;
    TOTAL_WIDTH: number;
    HALF_WIDTH: number;
    ITEM_LENGTH: number;
}

export function useComputedAnim(
    width: number,
    ITEM_LENGTH: number
): IComputedAnimResult {
    const VALID_LENGTH = ITEM_LENGTH - 1;
    const MAX = (VALID_LENGTH - 1) * width;
    const MIN = -((VALID_LENGTH - 1) * width);
    const TOTAL_WIDTH = width * ITEM_LENGTH;
    const HALF_WIDTH = 0.5 * width;

    return {
        MAX,
        MIN,
        TOTAL_WIDTH,
        HALF_WIDTH,
        ITEM_LENGTH,
    };
}
