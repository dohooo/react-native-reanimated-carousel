import { interpolate } from "react-native-reanimated";

import type { CarouselDirectionSign } from "../utils/carousel-direction";
import { toPhysicalHorizontalValue } from "../utils/carousel-direction";

export function normalLayout(opts: {
  size: number;
  isVertical: boolean;
  directionSign: CarouselDirectionSign;
}) {
  const { size, isVertical, directionSign } = opts;

  return (value: number) => {
    "worklet";
    const logicalTranslate = interpolate(value, [-1, 0, 1], [-size, 0, size]);
    const translate = isVertical
      ? logicalTranslate
      : toPhysicalHorizontalValue(logicalTranslate, directionSign);

    return {
      transform: [
        isVertical
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
