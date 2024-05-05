import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";

import type { DotStyle } from "./PaginationItem";
import { PaginationItem } from "./PaginationItem";

export interface BasicProps<T extends {} = {}> {
  progress: SharedValue<number>
  horizontal?: boolean
  data: Array<T>
  renderItem?: (item: T, index: number) => React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
  dotStyle?: DotStyle
  activeDotStyle?: DotStyle
  size?: number
  onPress?: (index: number) => void
}

export const Basic = <T extends {}>(props: BasicProps<T>) => {
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
  } = props;

  if (
    typeof size === "string" ||
    typeof dotStyle?.width === "string" ||
    typeof dotStyle?.height === "string"
  )
    throw new Error("size/width/height must be a number");

  return (
    <View
      style={[
        {
          justifyContent: "space-between",
          alignSelf: "center",
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
          <TouchableWithoutFeedback
            key={index}
            onPress={() => onPress?.(index)}
          >
            <PaginationItem
              index={index}
              size={size}
              count={data.length}
              dotStyle={dotStyle}
              animValue={progress}
              horizontal={!horizontal}
              activeDotStyle={activeDotStyle}
            >
              {renderItem?.(item, index)}
            </PaginationItem>
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );
};
