/**
 * This is used to supplement the accuracy of Javascript calculations
 */
export function fillNum(width: number, num: number) {
    'worklet';
    const remainder = num % width;
    if (remainder !== 0) {
        const sub = width - Math.abs(remainder);
        if (num < 0) {
            return num - sub;
        }
        if (num > 0) {
            return num + sub;
        }
    }
    return num;
}
