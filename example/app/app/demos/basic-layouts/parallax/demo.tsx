import * as React from "react";
import { View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { renderItem } from "@/utils/render-item";
import { useSharedValue } from "react-native-reanimated";

const defaultDataWith6Colors = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

function Index() {
  const progress = useSharedValue<number>(0);

  return (
    <View
      id="carousel-component"
      dataSet={{ kind: "basic-layouts", name: "parallax" }}
    >
      <Carousel
        autoPlayInterval={2000}
        data={defaultDataWith6Colors}
        height={258}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        width={430}
        style={{
          width: 430,
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        onProgressChange={progress}
        renderItem={renderItem({ rounded: true })}
      />
    </View>
  );
}

export default Index;
