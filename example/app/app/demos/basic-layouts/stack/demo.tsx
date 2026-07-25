import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import type { CarouselRef } from "react-native-reanimated-carousel";
import { Carousel } from "react-native-reanimated-carousel";

const defaultDataWith6Colors = ["#B0604D", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"];

function Index() {
  const ref = React.useRef<CarouselRef>(null);

  return (
    <View id="carousel-component" dataSet={{ kind: "basic-layouts", name: "stack" }}>
      <Carousel
        ref={ref}
        autoplayInterval={2000}
        data={defaultDataWith6Colors}
        loop={true}
        style={{
          width: 430 * 0.75,
          height: 220,
          alignItems: "center",
          justifyContent: "center",
        }}
        layout={{
          type: "horizontal-stack",
          exitDirection: "left",
          spacing: 18,
          visibleCount: 5,
        }}
        renderItem={renderItem({ rounded: true })}
      />
    </View>
  );
}

export default Index;
