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

import { window } from "@/constants/Sizes";
import { renderItem } from "@/utils/render-item";
import { Stack, YStack } from "tamagui";

const PAGE_WIDTH = window.width;
const colors = [
  "#26292E",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#CBBAF1",
];

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
    <YStack gap={"$2"}>
      <Stack mb={"$4"}>
        <Carousel
          ref={ref}
          {...baseOptions}
          loop
          onProgressChange={progress}
          style={{ width: PAGE_WIDTH }}
          data={colors}
          renderItem={renderItem({ rounded: true })}
        />
      </Stack>

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
        containerStyle={{
          gap: 10,
          marginBottom: 10,
        }}
        horizontal
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
          {
            gap: 5,
            marginBottom: 10,
          },
        ]}
        horizontal
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
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
        containerStyle={{
          gap: 5,
          marginBottom: 10,
        }}
        horizontal
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

      <Pagination.Custom<{ color: string }>
        progress={progress}
        data={colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 16,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
        activeDotStyle={{
          borderRadius: 8,
          width: 40,
          height: 30,
          overflow: "hidden",
          backgroundColor: "black",
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
        data={colors.map((color) => ({ color }))}
        size={20}
        dotStyle={{
          borderRadius: 16,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
        activeDotStyle={{
          borderRadius: 8,
          width: 40,
          height: 30,
          overflow: "hidden",
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
    </YStack>
  );
}

export default Index;
