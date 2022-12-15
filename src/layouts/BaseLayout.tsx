import React from "react";
import type { ViewStyle } from "react-native";
import type { AnimatedStyleProp } from "react-native-reanimated";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import type { ILayoutConfig } from "./stack";

import { useCheckMounted } from "../hooks/useCheckMounted";
import type { IOpts } from "../hooks/useOffsetX";
import { useOffsetX } from "../hooks/useOffsetX";
import type { IVisibleRanges } from "../hooks/useVisibleRanges";
import { LazyView } from "../LazyView";
import { CTX } from "../store";

export type TAnimationStyle = (value: number) => AnimatedStyleProp<ViewStyle>;

export const BaseLayout: React.FC<{
  index: number
  handlerOffset: Animated.SharedValue<number>
  visibleRanges: IVisibleRanges
  animationStyle: TAnimationStyle
  children: (ctx: {
    animationValue: Animated.SharedValue<number>
  }) => React.ReactElement
}> = (props) => {
  const mounted = useCheckMounted();
  const { handlerOffset, index, children, visibleRanges, animationStyle }
        = props;

  const context = React.useContext(CTX);
  const {
    props: {
      loop,
      dataLength,
      width,
      height,
      vertical,
      customConfig,
      mode,
      modeConfig,
    },
  } = context;
  const size = vertical ? height : width;
  const [shouldUpdate, setShouldUpdate] = React.useState(false);
  let offsetXConfig: IOpts = {
    handlerOffset,
    index,
    size,
    dataLength,
    loop,
    ...(typeof customConfig === "function" ? customConfig() : {}),
  };

  if (mode === "horizontal-stack") {
    const { snapDirection, showLength } = modeConfig as ILayoutConfig;

    offsetXConfig = {
      handlerOffset,
      index,
      size,
      dataLength,
      loop,
      type: snapDirection === "right" ? "negative" : "positive",
      viewCount: showLength,
    };
  }

  const x = useOffsetX(offsetXConfig, visibleRanges);
  const animationValue = useDerivedValue(() => x.value / size, [x, size]);
  const animatedStyle = useAnimatedStyle(
    () => animationStyle(x.value / size),
    [animationStyle],
  );

  const updateView = React.useCallback(
    (negativeRange: number[], positiveRange: number[]) => {
      mounted.current
                && setShouldUpdate(
                  (index >= negativeRange[0] && index <= negativeRange[1])
                        || (index >= positiveRange[0] && index <= positiveRange[1]),
                );
    },
    [index, mounted],
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
        animatedStyle,
      ]}
    >
      <LazyView shouldUpdate={shouldUpdate}>
        {children({ animationValue })}
      </LazyView>
    </Animated.View>
  );
};
