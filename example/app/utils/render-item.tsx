import { SBItem } from "@/components/SBItem";
import { SlideItem } from "@/components/SlideItem";
import { CarouselRenderItem } from "react-native-reanimated-carousel";

interface Options {
  rounded?: boolean;
}

export const renderItem =
  ({ rounded = false }: Options = {}): CarouselRenderItem<any> =>
  ({ index }: { index: number }) =>
    <SlideItem key={index} index={index} rounded={rounded} />;
