import React, { useMemo } from "react";
import {
  type StyleProp,
  type ViewProps,
  type ImageSourcePropType,
  type ImageStyle,
  StyleSheet,
  View,
  Text,
} from "react-native";
import type { AnimatedProps } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import Constants from "expo-constants";

import { Image } from "expo-image";

interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ImageStyle>;
  index?: number;
  imageType?: "dark" | "purple";
  rounded?: boolean;
}

const DARK_IMAGES = [
  require("@/assets/images/slide-images/dark-0.png"),
  require("@/assets/images/slide-images/dark-1.png"),
  require("@/assets/images/slide-images/dark-2.png"),
  require("@/assets/images/slide-images/dark-3.png"),
  require("@/assets/images/slide-images/dark-4.png"),
  require("@/assets/images/slide-images/dark-5.png"),
];

const PURPLE_IMAGES = [
  require("@/assets/images/slide-images/purple-0.png"),
  require("@/assets/images/slide-images/purple-1.png"),
  require("@/assets/images/slide-images/purple-2.png"),
  require("@/assets/images/slide-images/purple-3.png"),
  require("@/assets/images/slide-images/purple-4.png"),
  require("@/assets/images/slide-images/purple-5.png"),
];

export const SlideItem: React.FC<Props> = (props) => {
  const {
    style,
    index = 0,
    imageType = "purple",
    rounded = false,
    testID,
    ...animatedViewProps
  } = props;
  const enablePretty = Constants?.expoConfig?.extra?.enablePretty || false;

  const source = useMemo(() => {
    if (imageType === "dark") return DARK_IMAGES[index % DARK_IMAGES.length];
    return PURPLE_IMAGES[index % PURPLE_IMAGES.length];
  }, [imageType, index]);

  return (
    <Animated.View testID={testID} style={{ flex: 1 }} {...animatedViewProps}>
      <Image
        style={[style, styles.container, rounded && { borderRadius: 15 }]}
        source={source}
        contentPosition="center"
      />
      <View style={styles.overlay}>
        <View style={styles.overlayTextContainer}>
          <Text style={styles.overlayText}>{index}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  overlayTextContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 10,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
