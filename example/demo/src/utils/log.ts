/**
 * In worklet
 * e.g. runOnJS(log)(...);
 */
export function log(...msg: any) {
  console.log(...msg);
}

export function round(number: number) {
  "worklet";
  return Math.round(number);
}
