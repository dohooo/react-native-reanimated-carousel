import * as React from "react";
import { View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "@/components/SBItem";
import SButton from "@/components/SButton";
import { ElementsText, window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";

const PAGE_WIDTH = window.width;

function Index() {
  const [isFast, setIsFast] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          loop
          style={{
            width: PAGE_WIDTH,
            height: PAGE_WIDTH / 2,
          }}
          itemWidth={PAGE_WIDTH / 6}
          itemHeight={PAGE_WIDTH / 2}
          autoPlay={isAutoPlay}
          autoPlayInterval={isFast ? 100 : 2000}
          data={[...new Array(12).keys()]}
          renderItem={({ index }) => (
            <View
              style={{
                width: PAGE_WIDTH / 6,
                height: PAGE_WIDTH / 2,
              }}
            >
              <SBItem key={index} index={index} />
            </View>
          )}
        />
      </CaptureWrapper>
      <SButton
        onPress={() => {
          setIsFast(!isFast);
        }}
      >
        {isFast ? "NORMAL" : "FAST"}
      </SButton>
      <SButton
        onPress={() => {
          setIsAutoPlay(!isAutoPlay);
        }}
      >
        {ElementsText.AUTOPLAY}:{`${isAutoPlay}`}
      </SButton>
    </View>
  );
}

export default Index;
