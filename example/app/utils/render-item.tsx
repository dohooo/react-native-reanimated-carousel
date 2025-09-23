import { SlideItem } from "@/components/SlideItem";
import { ImageStyle, StyleProp } from "react-native";
import { CarouselRenderItem } from "react-native-reanimated-carousel";

interface Options {
  colorFill?: boolean;
  rounded?: boolean;
  style?: StyleProp<ImageStyle>;
}

export const renderItem =
  ({ rounded = false, colorFill = false, style }: Options = {}): CarouselRenderItem<any> =>
  ({ index }: { index: number }) => (
    <SlideItem key={index} index={index} rounded={rounded} colorFill={colorFill} style={style} />
  );
