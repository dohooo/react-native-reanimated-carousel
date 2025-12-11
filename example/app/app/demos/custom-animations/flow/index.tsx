import * as React from "react";
import { Text, View } from "react-native";
import { Extrapolation, interpolate } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import { faker } from "@faker-js/faker";

import { SlideItem } from "@/components/SlideItem";
import { window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";

function Index() {
  const headerHeight = 100;
  const scale = 0.9;

  const RIGHT_OFFSET = window.width * (1 - scale);

  const ITEM_WIDTH = window.width * scale;
  const ITEM_HEIGHT = 120;

  const PAGE_HEIGHT = window.height - headerHeight;
  const PAGE_WIDTH = window.width;

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";

      const translateY = interpolate(value, [-1, 0, 1], [-ITEM_HEIGHT, 0, ITEM_HEIGHT]);
      const right = interpolate(value, [1, 2, 3], [RIGHT_OFFSET, RIGHT_OFFSET * 2, RIGHT_OFFSET]);
      const opacity = interpolate(value, [1, 2, 3], [0.35, 1, 0.35], Extrapolation.CLAMP);

      return {
        transform: [{ translateY }],
        right,
        opacity,
      };
    },
    [RIGHT_OFFSET]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CaptureWrapper>
        <Carousel
          loop
          vertical
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          }}
          pagingEnabled={false}
          data={[...new Array(10).keys()].map((v) => faker.animal.dog())}
          renderItem={({ index, item }) => {
            return (
              <View
                key={index}
                style={{ flex: 1, padding: 10, width: ITEM_WIDTH, height: ITEM_HEIGHT }}
              >
                <View
                  style={{
                    alignItems: "flex-start",
                    flex: 1,
                    justifyContent: "space-between",
                    flexDirection: "row",
                    borderRadius: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        marginRight: 5,
                        backgroundColor: "gray",
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        maxWidth: ITEM_WIDTH * 0.3 - 40,
                        color: "white",
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: ITEM_WIDTH * 0.6,
                      height: ITEM_HEIGHT - 20,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: ITEM_WIDTH * 0.6,
                        height: ITEM_HEIGHT - 20,
                        borderRadius: 10,
                        marginRight: 5,
                      }}
                    >
                      <SlideItem index={index} />
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          customAnimation={animationStyle}
        />
      </CaptureWrapper>
    </View>
  );
}

export default Index;
