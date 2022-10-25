import { interpolate } from "react-native-reanimated";

export function normalLayout(opts: { size: number; vertical: boolean }) {
  const { size, vertical } = opts;

  return (value: number) => {
    "worklet";
    const translate = interpolate(value, [-1, 0, 1], [-size, 0, size]);

    return {
      transform: [
        vertical
          ? {
            translateY: translate,
          }
          : {
            translateX: translate,
          },
      ],
    };
  };
}
