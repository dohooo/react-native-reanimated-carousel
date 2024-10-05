import * as React from "react";
import { View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "@/components/SBItem";
import { window } from "@/constants/sizes";
import { PURPLE_IMAGES } from "@/constants/purple-images";

const PAGE_WIDTH = window.width;

const COUNT = 6;

function Index() {
  return (
    <View
      id="carousel-component"
      dataSet={{ kind: "custom-animations", name: "multiple" }}
    >
      <Carousel
        loop
        autoPlay
        vertical={false}
        width={PAGE_WIDTH / COUNT}
        height={PAGE_WIDTH / 2}
        style={{
          width: PAGE_WIDTH,
        }}
        data={PURPLE_IMAGES}
        renderItem={({ index }) => <SBItem key={index} index={index} />}
      />
    </View>
  );
}

export default Index;
