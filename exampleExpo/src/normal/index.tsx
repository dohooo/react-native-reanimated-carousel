import * as React from "react";
import { View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "../components/SBItem";
import SButton from "../components/SButton";
import { ElementsText, window } from "../constants";

const PAGE_WIDTH = window.width;

function Index() {
  const [data, setData] = React.useState([...new Array(4).keys()]);
  const [isVertical, setIsVertical] = React.useState(false);
  const [isFast, setIsFast] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const [isPagingEnabled, setIsPagingEnabled] = React.useState(true);
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = isVertical
    ? ({
      vertical: true,
      width: PAGE_WIDTH,
      height: PAGE_WIDTH / 2,
    } as const)
    : ({
      vertical: false,
      width: PAGE_WIDTH,
      height: PAGE_WIDTH / 2,
    } as const);

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        {...baseOptions}
        loop
        ref={ref}
        style={{ width: "100%" }}
        autoPlay={isAutoPlay}
        autoPlayInterval={isFast ? 100 : 2000}
        data={data}
        pagingEnabled={isPagingEnabled}
        onSnapToItem={index => console.log("current index:", index)}
        renderItem={({ index }) => <SBItem key={index} index={index} />}
      />
      <SButton
        onPress={() => {
          setData([...new Array(5).keys()]);
        }}
      >
        {"Change the data length to 5"}
      </SButton>
      <SButton
        onPress={() => {
          setData([...new Array(3).keys()]);
        }}
      >
        {"Change the data length to 3"}
      </SButton>
      <SButton
        onPress={() => {
          setIsVertical(!isVertical);
        }}
      >
        {isVertical ? "Set horizontal" : "Set Vertical"}
      </SButton>
      <SButton
        onPress={() => {
          setIsFast(!isFast);
        }}
      >
        {isFast ? "NORMAL" : "FAST"}
      </SButton>
      <SButton
        onPress={() => {
          setIsPagingEnabled(!isPagingEnabled);
        }}
      >
                PagingEnabled:{isPagingEnabled.toString()}
      </SButton>
      <SButton
        onPress={() => {
          setIsAutoPlay(!isAutoPlay);
        }}
      >
        {ElementsText.AUTOPLAY}:{`${isAutoPlay}`}
      </SButton>
      <SButton
        onPress={() => {
          console.log(ref.current?.getCurrentIndex());
        }}
      >
                Log current index
      </SButton>
      <SButton
        onPress={() => {
          setData(
            data.length === 6
              ? [...new Array(8).keys()]
              : [...new Array(6).keys()],
          );
        }}
      >
                Change data length to:{data.length === 6 ? 8 : 6}
      </SButton>
      <SButton
        onPress={() => {
          ref.current?.scrollTo({ count: -1, animated: true });
        }}
      >
                prev
      </SButton>
      <SButton
        onPress={() => {
          ref.current?.scrollTo({ count: 1, animated: true });
        }}
      >
                next
      </SButton>
    </View>
  );
}

export default Index;
