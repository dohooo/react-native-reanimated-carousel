import * as React from "react";
import { useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import type {
  ICarouselInstance,
  TCarouselProps,
} from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

import { CarouselSettings } from "@/components/CarouselSettings";
import { window } from "@/constants/Sizes";
import { renderItem } from "@/utils/render-item";
import {
  CustomButtonActionItem,
  CustomSelectActionItem,
} from "@/components/ActionItems";
import { ScrollView, YStack } from "tamagui";

const PAGE_WIDTH = window.width;

function Index() {
  const windowWidth = useWindowDimensions().width;
  const scrollOffsetValue = useSharedValue<number>(0);
  const [data, setData] = React.useState([...new Array(4).keys()]);
  const [carouselSettings, setCarouselSettings] =
    React.useState<Partial<TCarouselProps>>();
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = carouselSettings?.vertical
    ? ({
        vertical: true,
        width: windowWidth,
        height: PAGE_WIDTH / 2,
      } as const)
    : ({
        vertical: false,
        width: windowWidth,
        height: PAGE_WIDTH / 2,
      } as const);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <Carousel
        {...baseOptions}
        loop
        enabled // Default is true, just for demo
        ref={ref}
        defaultScrollOffsetValue={scrollOffsetValue}
        testID={"xxx"}
        style={{ width: "100%" }}
        autoPlay={carouselSettings?.autoPlay}
        autoPlayInterval={carouselSettings?.autoPlayInterval}
        data={data}
        onScrollStart={() => {
          console.log("===1");
        }}
        onScrollEnd={() => {
          console.log("===2");
        }}
        onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
          "worklet";
          g.enabled(false);
        }}
        pagingEnabled={carouselSettings?.pagingEnabled}
        onSnapToItem={(index: number) => console.log("current index:", index)}
        renderItem={renderItem()}
      />

      <ScrollView paddingHorizontal={"$2"} flex={1}>
        <YStack gap={"$2"}>
          <CarouselSettings
            defaultSettings={carouselSettings}
            onSettingChange={(settings) => {
              setCarouselSettings(settings);
            }}
          />
          <CustomSelectActionItem
            label="Change data length"
            value={data.length.toString()}
            onValueChange={(value) => {
              const num = Number(value);
              if (isNaN(num)) return;
              setData([...new Array(num).keys()]);
            }}
            options={[
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
              { label: "6", value: "6" },
              { label: "7", value: "7" },
              { label: "8", value: "8" },
            ]}
          />

          <CustomButtonActionItem
            label="Log current index"
            action={() => console.log(ref.current?.getCurrentIndex())}
          />
          <CustomButtonActionItem
            label="Swipe to prev"
            action={() => ref.current?.scrollTo({ count: -1, animated: true })}
          />
          <CustomButtonActionItem
            label="Swipe to next"
            action={() => ref.current?.scrollTo({ count: 1, animated: true })}
          />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Index;
