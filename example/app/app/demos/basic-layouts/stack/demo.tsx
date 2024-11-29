import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";

const defaultDataWith6Colors = ["#B0604D", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"];

function Index() {
  const ref = React.useRef<ICarouselInstance>(null);

  return (
    <View id="carousel-component" dataSet={{ kind: "basic-layouts", name: "stack" }}>
      <Carousel
        ref={ref}
        autoPlayInterval={2000}
        data={defaultDataWith6Colors}
        height={220}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        scrollAnimationDuration={100}
        width={430 * 0.75}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: 240,
        }}
        mode={"horizontal-stack"}
        modeConfig={{
          snapDirection: "left",
          stackInterval: 18,
        }}
        customConfig={() => ({ type: "positive", viewCount: 5 })}
        renderItem={renderItem({ rounded: true })}
      />
    </View>
  );
}

export default Index;
