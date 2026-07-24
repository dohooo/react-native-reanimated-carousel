import type { TransformsStyle, ViewStyle } from "react-native";
import { Dimensions } from "react-native";
import { Extrapolation, interpolate } from "react-native-reanimated";

import type { CarouselLayout } from "../types";
import type { CarouselDirectionSign } from "../utils/carousel-direction";
import { toPhysicalHorizontalValue } from "../utils/carousel-direction";

const screen = Dimensions.get("window");

type StackLayout = Extract<CarouselLayout, { type: "horizontal-stack" | "vertical-stack" }>;

export function horizontalStackLayout(
  config: StackLayout,
  directionSign: CarouselDirectionSign = 1
) {
  return (_value: number) => {
    "worklet";

    const {
      visibleCount,
      exitDirection: snapDirection = "left",
      exitDistance: moveSize = screen.width,
      spacing: stackInterval = 18,
      scaleStep: scaleInterval = 0.04,
      opacityStep: opacityInterval = 0.1,
      rotation: rotateZDeg = 30,
    } = config;

    const physicalProgress = toPhysicalHorizontalValue(_value, directionSign);
    const { validLength, value, inputRange } = getCommonVariables({
      showLength: visibleCount!,
      value: physicalProgress,
      snapDirection,
    });
    const { zIndex, opacity } = getCommonStyles({
      validLength,
      value,
      opacityInterval,
      snapDirection,
    });

    let translateX: number;
    let scale: number;
    let rotateZ: string;

    if (snapDirection === "left") {
      translateX = interpolate(
        value,
        inputRange,
        [-moveSize, 0, validLength * stackInterval],
        Extrapolation.CLAMP
      );
      scale = interpolate(
        value,
        inputRange,
        [1, 1, 1 - validLength * scaleInterval],
        Extrapolation.CLAMP
      );
      rotateZ = `${interpolate(value, inputRange, [-rotateZDeg, 0, 0], Extrapolation.CLAMP)}deg`;
    } else if (snapDirection === "right") {
      translateX = interpolate(
        value,
        inputRange,
        [-validLength * stackInterval, 0, moveSize],
        Extrapolation.CLAMP
      );
      scale = interpolate(
        value,
        inputRange,
        [1 - validLength * scaleInterval, 1, 1],
        Extrapolation.CLAMP
      );
      rotateZ = `${interpolate(value, inputRange, [0, 0, rotateZDeg], Extrapolation.CLAMP)}deg`;
    }

    const transform: TransformsStyle["transform"] = [
      {
        translateX: translateX!,
      },
      {
        scale: scale!,
      },
      {
        rotateZ: rotateZ!,
      },
    ];

    const styles: ViewStyle = {
      transform,
      zIndex,
      opacity,
    };

    return styles;
  };
}

export function verticalStackLayout(config: StackLayout) {
  return (_value: number) => {
    "worklet";

    const {
      visibleCount,
      exitDirection: snapDirection = "left",
      exitDistance: moveSize = screen.width,
      spacing: stackInterval = 18,
      scaleStep: scaleInterval = 0.04,
      opacityStep: opacityInterval = 0.1,
      rotation: rotateZDeg = 30,
    } = config;

    const { validLength, value, inputRange } = getCommonVariables({
      showLength: visibleCount!,
      value: _value,
      snapDirection,
    });
    const { zIndex, opacity } = getCommonStyles({
      validLength,
      value,
      opacityInterval,
      snapDirection,
    });

    let translateX: number;
    let scale: number;
    let rotateZ: string;
    let translateY: number;

    if (snapDirection === "left") {
      translateX = interpolate(value, inputRange, [-moveSize, 0, 0], Extrapolation.CLAMP);
      scale = interpolate(
        value,
        inputRange,
        [1, 1, 1 - validLength * scaleInterval],
        Extrapolation.CLAMP
      );
      rotateZ = `${interpolate(value, inputRange, [-rotateZDeg, 0, 0], Extrapolation.CLAMP)}deg`;
      translateY = interpolate(
        value,
        inputRange,
        [0, 0, validLength * stackInterval],
        Extrapolation.CLAMP
      );
    } else if (snapDirection === "right") {
      translateX = interpolate(value, inputRange, [0, 0, moveSize], Extrapolation.CLAMP);
      scale = interpolate(
        value,
        inputRange,
        [1 - validLength * scaleInterval, 1, 1],
        Extrapolation.CLAMP
      );
      rotateZ = `${interpolate(value, inputRange, [0, 0, rotateZDeg], Extrapolation.CLAMP)}deg`;
      translateY = interpolate(
        value,
        inputRange,
        [validLength * stackInterval, 0, 0],
        Extrapolation.CLAMP
      );
    }

    const transform: TransformsStyle["transform"] = [
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
    ];

    const styles: ViewStyle = {
      transform,
      zIndex,
      opacity,
    };

    return styles;
  };
}

function getCommonVariables(opts: {
  value: number;
  showLength: number;
  snapDirection: "left" | "right";
}) {
  "worklet";

  const { showLength, value: _value, snapDirection } = opts;
  function easeInOutCubic(v: number): number {
    return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
  }
  const page = Math.floor(Math.abs(_value));
  const diff = Math.abs(_value) % 1;
  const value = _value < 0 ? -(page + easeInOutCubic(diff)) : page + easeInOutCubic(diff);
  const validLength = showLength! - 1;

  let inputRange: [number, number, number];

  if (snapDirection === "left") inputRange = [-1, 0, validLength];
  else if (snapDirection === "right") inputRange = [-validLength, 0, 1];
  else throw new Error("snapDirection must be set to either left or right");

  return {
    inputRange,
    validLength,
    value,
  };
}

function getCommonStyles(opts: {
  value: number;
  validLength: number;
  opacityInterval: number;
  snapDirection: "left" | "right";
}) {
  "worklet";

  const { snapDirection, validLength, value, opacityInterval } = opts;

  let zIndex: number;
  let opacity: number;

  if (snapDirection === "left") {
    zIndex =
      Math.floor(
        interpolate(
          value,
          [-1.5, -1, -1 + Number.MIN_VALUE, 0, validLength],
          [Number.MIN_VALUE, validLength, validLength, validLength - 1, -1]
        ) * 10000
      ) / 100;

    opacity = interpolate(
      value,
      [-1, 0, validLength - 1, validLength],
      [0.25, 1, 1 - (validLength - 1) * opacityInterval, 0.25]
    );
  } else if (snapDirection === "right") {
    zIndex =
      Math.floor(
        interpolate(
          value,
          [-validLength, 0, 1 - Number.MIN_VALUE, 1, 1.5],
          [1, validLength - 1, validLength, validLength, Number.MIN_VALUE]
        ) * 10000
      ) / 100;
    opacity = interpolate(
      value,
      [-validLength, 1 - validLength, 0, 1],
      [0.25, 1 - (validLength - 1) * opacityInterval, 1, 0.25]
    );
  } else {
    throw new Error("snapDirection must be set to either left or right");
  }

  return {
    zIndex: Math.round(zIndex),
    opacity,
  };
}
