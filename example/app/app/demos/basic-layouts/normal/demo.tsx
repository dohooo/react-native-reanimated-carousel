import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Carousel } from "react-native-reanimated-carousel";

import { window } from "@/constants/sizes";

const defaultDataWith6Colors = ["#B0604D", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"];

function Index() {
  const scrollOffsetValue = useSharedValue<number>(0);

  return (
    <View id="carousel-component" dataSet={{ kind: "basic-layouts", name: "normal" }}>
      <Carousel
        testID={"normal-carousel-demo"}
        loop={true}
        autoplayInterval={2000}
        data={defaultDataWith6Colors}
        scrollOffsetValue={scrollOffsetValue}
        style={{ width: window.width, height: 258 }}
        onScrollStart={() => {
          console.log("Scroll start");
        }}
        onSnapToItem={(index: number) => console.log("current index:", index)}
        renderItem={renderItem({ rounded: true })}
      />
    </View>
  );
}

export default Index;
