import type { ScaledSize } from "react-native";
import { Dimensions, Platform } from "react-native";

export const HEADER_HEIGHT = 100;

export const ElementsText = {
  AUTOPLAY: "AutoPlay",
};

const isWeb = Platform.OS === "web";

export const MAX_WIDTH = 430;

export const window: ScaledSize = isWeb
  ? { width: MAX_WIDTH, height: 800, scale: 1, fontScale: 1 }
  : Dimensions.get("screen");
