export interface IComputedAnimResult {
    MAX: number;
    MIN: number;
    WL: number;
}

export function useComputedAnim(
    width: number,
    length: number
): IComputedAnimResult {
    const MAX = ((length - 1) / 2) * width * 1;
    const MIN = ((length - 1) / 2) * width * -1;
    const WL = width * length;

    return {
        MAX,
        MIN,
        WL,
    };
}
