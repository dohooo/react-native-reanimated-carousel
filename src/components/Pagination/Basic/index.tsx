import { type StyleProp, View, type ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import React from "react";
import type { DotStyle, PaginationItemAccessibilityOverrides } from "./PaginationItem";
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
  /**
   * Optional accessibility overrides for each pagination item.
   * Use this to fully control screen reader announcements per dot.
   */
  paginationItemAccessibility?: (
    index: number,
    length: number
  ) => PaginationItemAccessibilityOverrides;
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
    paginationItemAccessibility,
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
        const defaultAccessibilityLabel = carouselName
          ? `Slide ${index + 1} of ${data.length} - ${carouselName}`
          : `Slide ${index + 1} of ${data.length}`;
        const accessibilityOverrides = paginationItemAccessibility?.(index, data.length) ?? {};

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
            accessibilityLabel={
              accessibilityOverrides.accessibilityLabel ?? defaultAccessibilityLabel
            }
            accessibilityHint={accessibilityOverrides.accessibilityHint}
            accessibilityRole={accessibilityOverrides.accessibilityRole}
            accessibilityState={accessibilityOverrides.accessibilityState}
          >
            {renderItem?.(item, index)}
          </PaginationItem>
        );
      })}
    </View>
  );
};
