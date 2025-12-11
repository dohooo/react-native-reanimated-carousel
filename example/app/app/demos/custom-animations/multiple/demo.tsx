import * as React from "react";
import { View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "@/components/SBItem";
import { PURPLE_IMAGES } from "@/constants/purple-images";
import { window } from "@/constants/sizes";

const PAGE_WIDTH = window.width;

const COUNT = 6;

function Index() {
  return (
    <View
      id="carousel-component"
      dataSet={{ kind: "custom-animations", name: "multiple" }}
      style={{ width: PAGE_WIDTH, height: PAGE_WIDTH / 2 }}
    >
      <Carousel
        loop
        autoPlay
        vertical={false}
        style={{ width: PAGE_WIDTH, height: PAGE_WIDTH / 2 }}
        itemWidth={PAGE_WIDTH / COUNT}
        itemHeight={PAGE_WIDTH / 2}
        data={PURPLE_IMAGES}
        renderItem={({ index }) => (
          <View style={{ width: PAGE_WIDTH / COUNT, height: PAGE_WIDTH / 2 }}>
            <SBItem key={index} index={index} />
          </View>
        )}
      />
    </View>
  );
}

export default Index;
