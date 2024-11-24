import { PURPLE_IMAGES } from "@/constants/purple-images";
import { ImageSourcePropType } from "react-native";

export function getImages(length: number = PURPLE_IMAGES.length): ImageSourcePropType[] {
  const imageList = PURPLE_IMAGES;
  if (length < 1) {
    return [];
  }

  if (length > imageList.length) {
    return [
      ...Array.from({ length: length / imageList.length }, () => imageList).flat(),
      ...imageList.slice(0, length % imageList.length),
    ];
  }

  return imageList.slice(0, length - 1);
}
