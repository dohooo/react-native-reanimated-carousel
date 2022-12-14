import * as React from "react";
import { View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "../components/SBItem";
import { window } from "../constants";

const PAGE_WIDTH = window.width;

function Index() {
  const [data] = React.useState([...new Array(4).keys()]);
  const ref = React.useRef<ICarouselInstance>(null);
  return (
    <View style={{ flex: 1 }}>
      <Carousel
        width={PAGE_WIDTH}
        height={PAGE_WIDTH / 2}
        loop
        ref={ref}
        style={{ width: "100%" }}
        data={data}
        renderItem={({ index }) => <SBItem key={index} index={index} />}
        headerHeight={200}
        HeaderComponent={() => <View style={{ height: 200, backgroundColor: "green", width: "100%" }}></View>}
      />
    </View>
  );
}

export default Index;
