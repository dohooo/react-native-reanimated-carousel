import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import type { DefaultStyle } from "react-native-reanimated/lib/typescript/reanimated2/hook/commonTypes";

import type { DotStyle } from "./PaginationItem";
import { PaginationItem } from "./PaginationItem";

export interface ShapeProps<T extends {}> {
  progress: SharedValue<number>;
  horizontal?: boolean;
  data: Array<T>;
  renderItem?: (item: T, index: number) => React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  dotStyle?: DotStyle;
  activeDotStyle?: DotStyle;
  size?: number;
  onPress?: (index: number) => void;
  customReanimatedStyle?: (progress: number, index: number, length: number) => DefaultStyle;
  carouselName?: string;
}

export const Custom = <T extends {}>(props: ShapeProps<T>) => {
  const {
    activeDotStyle,
    dotStyle,
    progress,
    horizontal = true,
    data,
    size,
    containerStyle,
    renderItem,
    onPress,
    customReanimatedStyle,
    carouselName,
  } = props;

  if (
    typeof size === "string" ||
    typeof dotStyle?.width === "string" ||
    typeof dotStyle?.height === "string" ||
    typeof activeDotStyle?.width === "string" ||
    typeof activeDotStyle?.height === "string"
  )
    throw new Error("size/width/height must be a number");

  const maxItemWidth = Math.max(size ?? 0, dotStyle?.width ?? 0, activeDotStyle?.width ?? 0);
  const maxItemHeight = Math.max(size ?? 0, dotStyle?.height ?? 0, activeDotStyle?.height ?? 0);

  return (
    <View
      style={[
        {
          justifyContent: "space-between",
          alignSelf: "center",
          minWidth: maxItemWidth,
          minHeight: maxItemHeight,
        },
        horizontal
          ? {
              flexDirection: "row",
            }
          : {
              flexDirection: "column",
            },
        containerStyle,
      ]}
    >
      {data.map((item, index) => {
        return (
          <PaginationItem
            key={index}
            index={index}
            size={size}
            count={data.length}
            dotStyle={dotStyle}
            animValue={progress}
            horizontal={!horizontal}
            activeDotStyle={activeDotStyle}
            customReanimatedStyle={customReanimatedStyle}
            onPress={() => onPress?.(index)}
            accessibilityLabel={`Slide ${index + 1} of ${data.length} - ${carouselName}`}
          >
            {renderItem?.(item, index)}
          </PaginationItem>
        );
      })}
    </View>
  );
};
