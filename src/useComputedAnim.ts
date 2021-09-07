export interface IComputedAnimResult {
    MAX: number;
    MIN: number;
    WL: number;
    LENGTH: number;
}

export function useComputedAnim(
    width: number,
    LENGTH: number
): IComputedAnimResult {
    const MAX = (LENGTH - 2) * width;
    const MIN = -MAX;
    const WL = width * LENGTH;

    return {
        MAX,
        MIN,
        WL,
        LENGTH,
    };
}
