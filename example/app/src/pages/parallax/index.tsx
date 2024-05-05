import * as React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

import { SBItem } from "../../components/SBItem";
import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";

const PAGE_WIDTH = window.width;
const colors = [
  "#26292E",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

function Index() {
  const [isVertical, setIsVertical] = React.useState(false);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [pagingEnabled, setPagingEnabled] = React.useState<boolean>(true);
  const [snapEnabled, setSnapEnabled] = React.useState<boolean>(true);
  const progress = useSharedValue<number>(0);
  const baseOptions = isVertical
    ? ({
        vertical: true,
        width: PAGE_WIDTH * 0.86,
        height: PAGE_WIDTH * 0.6,
      } as const)
    : ({
        vertical: false,
        width: PAGE_WIDTH,
        height: PAGE_WIDTH * 0.6,
      } as const);

  const ref = React.useRef<ICarouselInstance>(null);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <Carousel
        ref={ref}
        {...baseOptions}
        style={{
          width: PAGE_WIDTH,
        }}
        loop
        pagingEnabled={pagingEnabled}
        snapEnabled={snapEnabled}
        autoPlay={autoPlay}
        autoPlayInterval={1500}
        onProgressChange={progress}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        data={colors}
        renderItem={({ index }) => <SBItem index={index} />}
      />

      <Pagination.Basic
        progress={progress}
        data={colors}
        dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        containerStyle={{ gap: 5, marginBottom: 10 }}
        onPress={onPressPagination}
      />

      <Pagination.Basic<{ color: string }>
        progress={progress}
        data={colors.map((color) => ({ color }))}
        dotStyle={{
          width: 25,
          height: 4,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
        activeDotStyle={{
          overflow: "hidden",
        }}
        containerStyle={[
          isVertical
            ? {
                position: "absolute",
                width: 25,
                right: 5,
                top: 40,
              }
            : undefined,
          {
            gap: 10,
            marginBottom: 10,
          },
        ]}
        horizontal={!isVertical}
        onPress={onPressPagination}
      />

      <Pagination.Basic<{ color: string }>
        progress={progress}
        data={colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 100,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
        activeDotStyle={{
          borderRadius: 100,
          overflow: "hidden",
        }}
        containerStyle={[
          isVertical
            ? {
                position: "absolute",
                width: 20,
                right: 5,
                top: 40,
              }
            : undefined,
          {
            gap: 5,
            marginBottom: 10,
          },
        ]}
        horizontal={!isVertical}
        onPress={onPressPagination}
      />

      <Pagination.Basic<{ color: string }>
        progress={progress}
        data={colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 100,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
        activeDotStyle={{
          borderRadius: 100,
          overflow: "hidden",
        }}
        containerStyle={[
          isVertical
            ? {
                position: "absolute",
                width: 20,
                right: 5,
                top: 40,
              }
            : undefined,
        ]}
        horizontal={!isVertical}
        renderItem={(item) => (
          <View
            style={{
              backgroundColor: item.color,
              flex: 1,
            }}
          />
        )}
        onPress={onPressPagination}
      />

      <SButton
        onPress={() => setAutoPlay(!autoPlay)}
      >{`${ElementsText.AUTOPLAY}:${autoPlay}`}</SButton>
      <SButton
        onPress={() => {
          setIsVertical(!isVertical);
        }}
      >
        {isVertical ? "Set horizontal" : "Set Vertical"}
      </SButton>
      <SButton
        onPress={() => {
          setPagingEnabled(!pagingEnabled);
        }}
      >
        {`pagingEnabled:${pagingEnabled}`}
      </SButton>
      <SButton
        onPress={() => {
          setSnapEnabled(!snapEnabled);
        }}
      >
        {`snapEnabled:${snapEnabled}`}
      </SButton>
    </View>
  );
}

export default Index;
