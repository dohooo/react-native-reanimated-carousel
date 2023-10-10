import type { PropsWithChildren } from "react";
import React from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { ILayoutConfig } from "./parallax";

import { useOffsetX } from "../hooks/useOffsetX";
import type { IVisibleRanges } from "../hooks/useVisibleRanges";
import type { IComputedDirectionTypes } from "../types";

export const ParallaxLayout: React.FC<PropsWithChildren<IComputedDirectionTypes<
{
  loop?: boolean
  handlerOffset: Animated.SharedValue<number>
  index: number
  dataLength: number
  visibleRanges: IVisibleRanges
} & ILayoutConfig
>>> = (props) => {
  const {
    handlerOffset,
    parallaxScrollingOffset = 100,
    parallaxScrollingScale = 0.8,
    parallaxAdjacentItemScale = parallaxScrollingScale ** 2,
    index,
    width,
    height,
    loop,
    dataLength,
    children,
    visibleRanges,
    vertical,
  } = props;

  const size = props.vertical ? props.height : props.width;

  const x = useOffsetX(
    {
      handlerOffset,
      index,
      size,
      dataLength,
      loop,
    },
    visibleRanges,
  );

  const offsetXStyle = useAnimatedStyle(() => {
    const value = x.value / size;

    const translate = interpolate(
      value,
      [-1, 0, 1],
      [
        -size + parallaxScrollingOffset,
        0,
        size - parallaxScrollingOffset,
      ],
      Extrapolate.EXTEND,
    );

    const zIndex = interpolate(
      value,
      [-1, 0, 1],
      [0, size, 0],
      Extrapolate.CLAMP,
    );

    const scale = interpolate(
      value,
      [-1, 0, 1],
      [
        parallaxAdjacentItemScale,
        parallaxScrollingScale,
        parallaxAdjacentItemScale,
      ],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        vertical
          ? {
            translateY: translate,
          }
          : {
            translateX: translate,
          },
        {
          scale,
        },
      ],
      zIndex,
    };
  }, [loop, vertical, parallaxScrollingOffset]);

  return (
    <Animated.View
      style={[
        {
          width: width || "100%",
          height: height || "100%",
          position: "absolute",
        },
        offsetXStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};
