/**
 * In worklet
 * e.g. runOnJS(lop)(...);
 */
export function log(...msg: any) {
  console.log(...msg);
}

export function round(number: number) {
  "worklet";
  return Math.round(number);
}
