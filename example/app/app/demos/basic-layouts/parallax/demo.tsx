import { window } from "@/constants/sizes";
import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

const defaultDataWith6Colors = ["#B0604D", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"];

function Index() {
  const progress = useSharedValue<number>(0);

  return (
    <View id="carousel-component" dataSet={{ kind: "basic-layouts", name: "parallax" }}>
      <Carousel
        autoPlayInterval={2000}
        data={defaultDataWith6Colors}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        style={{
          width: window.width,
          height: 258,
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
