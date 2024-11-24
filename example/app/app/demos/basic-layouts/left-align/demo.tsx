import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const defaultDataWith6Colors = ["#B0604D", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"];

function Index() {
  return (
    <View id="carousel-component" dataSet={{ kind: "basic-layouts", name: "left-align" }}>
      <Carousel
        loop={true}
        width={430}
        height={258}
        snapEnabled={true}
        pagingEnabled={true}
        autoPlayInterval={2000}
        data={defaultDataWith6Colors}
        style={{ width: "100%" }}
        onSnapToItem={(index) => console.log("current index:", index)}
        renderItem={renderItem({ rounded: true, style: { marginRight: 8 } })}
      />
    </View>
  );
}

export default Index;
