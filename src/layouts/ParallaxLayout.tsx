import React from "react";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { ILayoutConfig } from "./parallax";

import { useOffsetX } from "../hooks/useOffsetX";
import type { IVisibleRanges } from "../hooks/useVisibleRanges";
import { LazyView } from "../LazyView";
import type { IComputedDirectionTypes } from "../types";

export const ParallaxLayout: React.FC<
IComputedDirectionTypes<
{
  loop?: boolean
  handlerOffset: Animated.SharedValue<number>
  index: number
  dataLength: number
  visibleRanges: IVisibleRanges
} & ILayoutConfig
>
> = (props) => {
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

  const [shouldUpdate, setShouldUpdate] = React.useState(false);

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

  const updateView = React.useCallback(
    (negativeRange: number[], positiveRange: number[]) => {
      setShouldUpdate(
        (index >= negativeRange[0] && index <= negativeRange[1])
                    || (index >= positiveRange[0] && index <= positiveRange[1]),
      );
    },
    [index],
  );

  useAnimatedReaction(
    () => visibleRanges.value,
    () => {
      runOnJS(updateView)(
        visibleRanges.value.negativeRange,
        visibleRanges.value.positiveRange,
      );
    },
    [visibleRanges.value],
  );

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
      <LazyView shouldUpdate={shouldUpdate}>{children}</LazyView>
    </Animated.View>
  );
};
