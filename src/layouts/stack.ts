import { useMemo } from "react";
import type { TransformsStyle, ViewStyle } from "react-native";
import { Dimensions } from "react-native";
import { Extrapolate, interpolate } from "react-native-reanimated";

import type { IComputedDirectionTypes, CustomConfig } from "../types";

const screen = Dimensions.get("window");

export interface ILayoutConfig {
  showLength?: number
  moveSize?: number
  stackInterval?: number
  scaleInterval?: number
  opacityInterval?: number
  rotateZDeg?: number
  snapDirection?: "left" | "right"
}

export type TStackModeProps = IComputedDirectionTypes<{
  /**
     * Carousel Animated transitions.
     */
  mode?: "horizontal-stack" | "vertical-stack"
  /**
     * Stack animation style.
     * @default
     *     mode: 'vertical',
     *     snapDirection: 'right',
     *     moveSize: window.width,
     *     stackInterval: 30,
     *     scaleInterval: 0.08,
     *     rotateZDeg: 135,
     */
  modeConfig?: ILayoutConfig
}>;

export function horizontalStackLayout(modeConfig: ILayoutConfig = {}) {
  return (_value: number) => {
    "worklet";

    const {
      showLength,
      snapDirection = "left",
      moveSize = screen.width,
      stackInterval = 18,
      scaleInterval = 0.04,
      opacityInterval = 0.1,
      rotateZDeg = 30,
    } = modeConfig;

    const transform: TransformsStyle["transform"] = [];
    const { validLength, value, inputRange } = getCommonVariables({
      showLength: showLength!,
      value: _value,
      snapDirection,
    });
    const { zIndex, opacity } = getCommonStyles({
      validLength,
      value,
      opacityInterval,
      snapDirection,
    });

    const styles: ViewStyle = {
      transform,
      zIndex,
      opacity,
    };

    let translateX: number;
    let scale: number;
    let rotateZ: string;

    if (snapDirection === "left") {
      translateX = interpolate(
        value,
        inputRange,
        [-moveSize, 0, validLength * stackInterval],
        Extrapolate.CLAMP,
      );
      scale = interpolate(
        value,
        inputRange,
        [1, 1, 1 - validLength * scaleInterval],
        Extrapolate.CLAMP,
      );
      rotateZ = `${interpolate(
        value,
        inputRange,
        [-rotateZDeg, 0, 0],
        Extrapolate.CLAMP,
      )}deg`;
    }
    else if (snapDirection === "right") {
      translateX = interpolate(
        value,
        inputRange,
        [-validLength * stackInterval, 0, moveSize],
        Extrapolate.CLAMP,
      );
      scale = interpolate(
        value,
        inputRange,
        [1 - validLength * scaleInterval, 1, 1],
        Extrapolate.CLAMP,
      );
      rotateZ = `${interpolate(
        value,
        inputRange,
        [0, 0, rotateZDeg],
        Extrapolate.CLAMP,
      )}deg`;
    }

    transform.push(
      {
        translateX: translateX!,
      },
      {
        scale: scale!,
      },
      {
        rotateZ: rotateZ!,
      },
    );

    return styles;
  };
}

export function useHorizontalStackLayout(
  customAnimationConfig: ILayoutConfig = {},
  customConfig: CustomConfig = {},
) {
  const config = useMemo(
    () => ({
      type:
                customAnimationConfig.snapDirection === "right"
                  ? "negative"
                  : "positive",
      viewCount: customAnimationConfig.showLength,
      ...customConfig,
    }),
    [customAnimationConfig, customConfig],
  );

  return {
    layout: horizontalStackLayout(customAnimationConfig),
    config,
  };
}

export function verticalStackLayout(modeConfig: ILayoutConfig = {}) {
  return (_value: number) => {
    "worklet";

    const {
      showLength,
      snapDirection = "left",
      moveSize = screen.width,
      stackInterval = 18,
      scaleInterval = 0.04,
      opacityInterval = 0.1,
      rotateZDeg = 30,
    } = modeConfig;
    const transform: TransformsStyle["transform"] = [];
    const { validLength, value, inputRange } = getCommonVariables({
      showLength: showLength!,
      value: _value,
      snapDirection,
    });
    const { zIndex, opacity } = getCommonStyles({
      validLength,
      value,
      opacityInterval,
      snapDirection,
    });

    const styles: ViewStyle = {
      transform,
      zIndex,
      opacity,
    };

    let translateX: number;
    let scale: number;
    let rotateZ: string;
    let translateY: number;

    if (snapDirection === "left") {
      translateX = interpolate(
        value,
        inputRange,
        [-moveSize, 0, 0],
        Extrapolate.CLAMP,
      );
      scale = interpolate(
        value,
        inputRange,
        [1, 1, 1 - validLength * scaleInterval],
        Extrapolate.CLAMP,
      );
      rotateZ = `${interpolate(
        value,
        inputRange,
        [-rotateZDeg, 0, 0],
        Extrapolate.CLAMP,
      )}deg`;
      translateY = interpolate(
        value,
        inputRange,
        [0, 0, validLength * stackInterval],
        Extrapolate.CLAMP,
      );
    }
    else if (snapDirection === "right") {
      translateX = interpolate(
        value,
        inputRange,
        [0, 0, moveSize],
        Extrapolate.CLAMP,
      );
      scale = interpolate(
        value,
        inputRange,
        [1 - validLength * scaleInterval, 1, 1],
        Extrapolate.CLAMP,
      );
      rotateZ = `${interpolate(
        value,
        inputRange,
        [0, 0, rotateZDeg],
        Extrapolate.CLAMP,
      )}deg`;
      translateY = interpolate(
        value,
        inputRange,
        [validLength * stackInterval, 0, 0],
        Extrapolate.CLAMP,
      );
    }

    transform.push(
      {
        translateX: translateX!,
      },
      {
        scale: scale!,
      },
      {
        rotateZ: rotateZ!,
      },
      {
        translateY: translateY!,
      },
    );

    return styles;
  };
}

function getCommonVariables(opts: {
  value: number
  showLength: number
  snapDirection: "left" | "right"
}) {
  "worklet";

  const { showLength, value: _value, snapDirection } = opts;
  function easeInOutCubic(v: number): number {
    return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
  }
  const page = Math.floor(Math.abs(_value));
  const diff = Math.abs(_value) % 1;
  const value
        = _value < 0
          ? -(page + easeInOutCubic(diff))
          : page + easeInOutCubic(diff);
  const validLength = showLength! - 1;

  let inputRange: [number, number, number];

  if (snapDirection === "left")
    inputRange = [-1, 0, validLength];
  else if (snapDirection === "right")
    inputRange = [-validLength, 0, 1];
  else
    throw new Error("snapDirection must be set to either left or right");

  return {
    inputRange,
    validLength,
    value,
  };
}

function getCommonStyles(opts: {
  value: number
  validLength: number
  opacityInterval: number
  snapDirection: "left" | "right"
}) {
  "worklet";

  const { snapDirection, validLength, value, opacityInterval } = opts;

  let zIndex: number;
  let opacity: number;

  if (snapDirection === "left") {
    zIndex
            = Math.floor(
        interpolate(
          value,
          [-1.5, -1, -1 + Number.MIN_VALUE, 0, validLength],
          [
            Number.MIN_VALUE,
            validLength,
            validLength,
            validLength - 1,
            -1,
          ],
        ) * 10000,
      ) / 100;

    opacity = interpolate(
      value,
      [-1, 0, validLength - 1, validLength],
      [0.25, 1, 1 - (validLength - 1) * opacityInterval, 0.25],
    );
  }
  else if (snapDirection === "right") {
    zIndex
            = Math.floor(
        interpolate(
          value,
          [-validLength, 0, 1 - Number.MIN_VALUE, 1, 1.5],
          [
            1,
            validLength - 1,
            validLength,
            validLength,
            Number.MIN_VALUE,
          ],
        ) * 10000,
      ) / 100;
    opacity = interpolate(
      value,
      [-validLength, 1 - validLength, 0, 1],
      [0.25, 1 - (validLength - 1) * opacityInterval, 1, 0.25],
    );
  }
  else {
    throw new Error("snapDirection must be set to either left or right");
  }

  return {
    zIndex,
    opacity,
  };
}
