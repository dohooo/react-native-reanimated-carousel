import React from "react";
import type { ImageSourcePropType, StyleProp, ViewProps, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { LongPressGestureHandler } from "react-native-gesture-handler";
import type { AnimatedProps } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import Constants from "expo-constants";

import { SlideItem } from "./SlideItem";

interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ViewStyle>;
  index?: number;
  pretty?: boolean;
  showIndex?: boolean;
  img?: ImageSourcePropType;
  rounded?: boolean;
  testID?: string;
}

export const SBItem: React.FC<Props> = (props) => {
  const {
    style,
    showIndex = true,
    index,
    pretty,
    img,
    rounded = true,
    testID,
    ...animatedViewProps
  } = props;
  const enablePretty = Constants?.expoConfig?.extra?.enablePretty || false;
  const [isPretty, setIsPretty] = React.useState(pretty || enablePretty);
  return (
    <LongPressGestureHandler
      // Web only. Without it the handler claims every touch on the slide, so the
      // carousel's own touch-action (set by its embedder) could not let the page scroll.
      touchAction="auto"
      onActivated={() => {
        setIsPretty(!isPretty);
      }}
    >
      <Animated.View testID={testID} style={styles.container} {...animatedViewProps}>
        <View style={[styles.card, style]}>
          <SlideItem index={index} rounded={rounded} source={img} showIndex={showIndex} />
        </View>
      </Animated.View>
    </LongPressGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    height: "100%",
  },
});
