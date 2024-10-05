import * as React from "react";
import { View } from "react-native";
import {
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

import { renderItem } from "@/utils/render-item";

const defaultDataWith6Colors = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

const PAGE_WIDTH = 430;

function Index() {
  const progress = useSharedValue<number>(0);
  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH,
    height: PAGE_WIDTH * 0.6,
  } as const;

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
      id="carousel-component"
      dataSet={{ kind: "utils", name: "pagination" }}
      style={{ gap: 10 }}
    >
      <View style={{ marginBottom: 10 }}>
        <Carousel
          ref={ref}
          {...baseOptions}
          loop
          onProgressChange={progress}
          style={{ width: PAGE_WIDTH }}
          data={defaultDataWith6Colors}
          renderItem={renderItem({ rounded: true })}
        />
      </View>

      <Pagination.Basic
        progress={progress}
        data={defaultDataWith6Colors}
        dotStyle={{ backgroundColor: "#262626" }}
        activeDotStyle={{ backgroundColor: "#f1f1f1" }}
        containerStyle={{ gap: 5, marginBottom: 10 }}
        onPress={onPressPagination}
      />

      <Pagination.Basic<{ color: string }>
        progress={progress}
        data={defaultDataWith6Colors.map((color) => ({ color }))}
        dotStyle={{
          width: 25,
          height: 4,
          backgroundColor: "#262626",
        }}
        activeDotStyle={{
          overflow: "hidden",
          backgroundColor: "#f1f1f1",
        }}
        containerStyle={{
          gap: 10,
          marginBottom: 10,
        }}
        horizontal
        onPress={onPressPagination}
      />

      <Pagination.Basic<{ color: string }>
        progress={progress}
        data={defaultDataWith6Colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 100,
          backgroundColor: "#262626",
        }}
        activeDotStyle={{
          borderRadius: 100,
          overflow: "hidden",
          backgroundColor: "#f1f1f1",
        }}
        containerStyle={[
          {
            gap: 5,
            marginBottom: 10,
          },
        ]}
        horizontal
        onPress={onPressPagination}
      />

      <Pagination.Custom<{ color: string }>
        progress={progress}
        data={defaultDataWith6Colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 16,
          backgroundColor: "#262626",
        }}
        activeDotStyle={{
          borderRadius: 8,
          width: 40,
          height: 30,
          overflow: "hidden",
          backgroundColor: "#f1f1f1",
        }}
        containerStyle={{
          gap: 5,
          marginBottom: 10,
          alignItems: "center",
          height: 10,
        }}
        horizontal
        onPress={onPressPagination}
        customReanimatedStyle={(progress, index, length) => {
          let val = Math.abs(progress - index);
          if (index === 0 && progress > length - 1) {
            val = Math.abs(progress - length);
          }

          return {
            transform: [
              {
                translateY: interpolate(
                  val,
                  [0, 1],
                  [0, 0],
                  Extrapolation.CLAMP,
                ),
              },
            ],
          };
        }}
      />

      <Pagination.Custom<{ color: string }>
        progress={progress}
        data={defaultDataWith6Colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 16,
          backgroundColor: "#262626",
        }}
        activeDotStyle={{
          borderRadius: 8,
          width: 40,
          height: 30,
          overflow: "hidden",
          backgroundColor: "#f1f1f1",
        }}
        containerStyle={{
          gap: 5,
          alignItems: "center",
          height: 10,
        }}
        horizontal
        onPress={onPressPagination}
        customReanimatedStyle={(progress, index, length) => {
          let val = Math.abs(progress - index);
          if (index === 0 && progress > length - 1) {
            val = Math.abs(progress - length);
          }

          return {
            transform: [
              {
                translateY: interpolate(
                  val,
                  [0, 1],
                  [0, 0],
                  Extrapolation.CLAMP,
                ),
              },
            ],
          };
        }}
        renderItem={(item) => (
          <View
            style={{
              backgroundColor: item.color,
              flex: 1,
            }}
          />
        )}
      />
    </View>
  );
}

export default Index;
