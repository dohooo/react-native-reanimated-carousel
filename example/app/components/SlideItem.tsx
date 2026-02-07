import { PURPLE_IMAGES } from "@/constants/purple-images";
import React, { useMemo } from "react";
import {
  ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";
import type { AnimatedProps } from "react-native-reanimated";
import Animated from "react-native-reanimated";

interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ImageStyle>;
  index?: number;
  rounded?: boolean;
  source?: ImageSourcePropType;
  colorFill?: boolean;
}

export const SlideItem: React.FC<Props> = (props) => {
  const {
    style,
    index = 0,
    rounded = false,
    testID,
    colorFill = false,
    ...animatedViewProps
  } = props;

  const source = useMemo(
    () => props.source || PURPLE_IMAGES[index % PURPLE_IMAGES.length],
    [index, props.source]
  );

  return (
    <Animated.View testID={testID} style={{ flex: 1 }} {...animatedViewProps}>
      {!colorFill && (
        <Animated.Image
          style={[style, styles.container, rounded && { borderRadius: 15 }]}
          source={source}
          resizeMode="cover"
        />
      )}
      {colorFill && <View style={[styles.colorFill, rounded && { borderRadius: 15 }]} />}
      <View style={styles.overlay}>
        <View style={styles.overlayTextContainer}>
          <Text testID={`slide-index-${index}`} style={styles.overlayText}>{`Slide ${index}`}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
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
  colorFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "gray",
  },
});
