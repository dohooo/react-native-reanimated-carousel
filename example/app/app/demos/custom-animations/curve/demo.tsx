import * as React from "react";
import { View } from "react-native";
import { Extrapolation, interpolate } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "@/components/SBItem";
import { window } from "@/constants/sizes";
import { withAnchorPoint } from "@/utils/anchor-point";

const PAGE_WIDTH = window.width / 5;
const colors = [
  "#26292E",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

function Index() {
  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH,
    height: PAGE_WIDTH * 0.6,
  } as const;

  return (
    <View
      style={{
        alignItems: "center",
      }}
      id="carousel-component"
      dataSet={{ kind: "custom-animations", name: "curve" }}
    >
      <Carousel
        {...baseOptions}
        loop
        style={{
          height: window.width / 2,
          width: window.width,
          justifyContent: "center",
          alignItems: "center",
        }}
        autoPlayInterval={150}
        scrollAnimationDuration={600}
        customAnimation={(value: number) => {
          "worklet";
          const size = PAGE_WIDTH;
          const scale = interpolate(
            value,
            [-2, -1, 0, 1, 2],
            [1.7, 1.2, 1, 1.2, 1.7],
            Extrapolation.CLAMP,
          );

          const translate = interpolate(
            value,
            [-2, -1, 0, 1, 2],
            [-size * 1.45, -size * 0.9, 0, size * 0.9, size * 1.45],
          );

          const transform = {
            transform: [
              { scale },
              {
                translateX: translate,
              },
              { perspective: 150 },
              {
                rotateY: `${interpolate(
                  value,
                  [-1, 0, 1],
                  [30, 0, -30],
                  Extrapolation.CLAMP,
                )}deg`,
              },
            ],
          };

          return {
            ...withAnchorPoint(
              transform,
              { x: 0.5, y: 0.5 },
              {
                width: baseOptions.width,
                height: baseOptions.height,
              },
            ),
          };
        }}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        data={colors}
        renderItem={({ index }) => <SBItem index={index} />}
      />
    </View>
  );
}

export default Index;
