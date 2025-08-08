import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";
import { Extrapolation, interpolate } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import SButton from "@/components/SButton";
import { SlideItem } from "@/components/SlideItem";
import { ElementsText, window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { getImages } from "@/utils/get-images";

const PAGE_WIDTH = window.width;

function Index() {
  const [isFast, setIsFast] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const itemSize = PAGE_WIDTH / 2;
  const centerOffset = PAGE_WIDTH / 2 - itemSize / 2;

  const dataLength = 18;

  const sideItemCount = 3;
  const sideItemWidth = (PAGE_WIDTH - itemSize) / (2 * sideItemCount);

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";

      const itemOffsetInput = new Array(sideItemCount * 2 + 1)
        .fill(null)
        .map((_, index) => index - sideItemCount);

      const itemOffset = interpolate(
        value,
        // e.g. [0,1,2,3,4,5,6] -> [-3,-2,-1,0,1,2,3]
        itemOffsetInput,
        itemOffsetInput.map((item) => {
          if (item < 0) {
            return (-itemSize + sideItemWidth) * Math.abs(item);
          }

          if (item > 0) {
            return (itemSize - sideItemWidth) * (Math.abs(item) - 1);
          }

          return 0;
        }) as number[]
      );

      const translate =
        interpolate(value, [-1, 0, 1], [-itemSize, 0, itemSize]) + centerOffset - itemOffset;

      const width = interpolate(
        value,
        [-1, 0, 1],
        [sideItemWidth, itemSize, sideItemWidth],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          {
            translateX: translate,
          },
        ],
        width,
        overflow: "hidden",
      };
    },
    [centerOffset, itemSize, sideItemWidth, sideItemCount]
  );

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          width={itemSize}
          height={PAGE_WIDTH / 2}
          style={{
            width: PAGE_WIDTH,
            height: PAGE_WIDTH / 2,
            backgroundColor: "black",
          }}
          loop
          windowSize={Math.round(dataLength / 2)}
          scrollAnimationDuration={1500}
          autoPlay={isAutoPlay}
          autoPlayInterval={isFast ? 100 : 1200}
          data={getImages(10)}
          renderItem={({ index, animationValue }) => (
            <Item animationValue={animationValue} index={index} key={index} />
          )}
          customAnimation={animationStyle}
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

const Item: React.FC<{
  index: number;
  animationValue: Animated.SharedValue<number>;
}> = ({ index }) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log(index);
      }}
      containerStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          justifyContent: "center",
          overflow: "hidden",
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", height: "100%" }}>
          <SlideItem index={index} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
});

export default Index;
