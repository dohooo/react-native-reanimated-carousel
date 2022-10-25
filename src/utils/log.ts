/**
 * In worklet
 * e.g. runOnJS(lop)(...);
 */
export function log(...msg: any) {
  // eslint-disable-next-line no-console
  console.log(...msg);
}

export function round(number: number) {
  "worklet";
  return Math.round(number);
}
