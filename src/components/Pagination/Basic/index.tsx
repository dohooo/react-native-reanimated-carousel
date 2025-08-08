import { type StyleProp, View, type ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import React from "react";
import type { DotStyle } from "./PaginationItem";
import { PaginationItem } from "./PaginationItem";

export interface BasicProps<T> {
  progress: SharedValue<number>;
  horizontal?: boolean;
  data: Array<T>;
  renderItem?: (item: T, index: number) => React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  dotStyle?: DotStyle;
  activeDotStyle?: DotStyle;
  size?: number;
  onPress?: (index: number) => void;
  carouselName?: string;
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
    carouselName,
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
          <PaginationItem
            key={index}
            index={index}
            size={size}
            count={data.length}
            dotStyle={dotStyle}
            animValue={progress}
            horizontal={!horizontal}
            activeDotStyle={activeDotStyle}
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
