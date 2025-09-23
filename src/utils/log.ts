/**
 * In worklet
 * e.g. scheduleOnRN(lop, ...);
 */
export function log(...msg: any) {
  console.log(...msg);
}

export function round(number: number) {
  "worklet";
  return Math.round(number);
}
