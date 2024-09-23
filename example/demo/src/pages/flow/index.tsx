import * as React from "react";
import { Text, View, Image } from "react-native";
import { interpolate } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import { faker } from "@faker-js/faker";
import { BlurView } from "expo-blur";

import { window } from "../../constants";

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

      const translateY = interpolate(
        value,
        [-1, 0, 1],
        [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
      );
      const right = interpolate(
        value,
        [-1, -0.2, 1],
        [RIGHT_OFFSET / 2, RIGHT_OFFSET, RIGHT_OFFSET / 3],
      );
      return {
        transform: [{ translateY }],
        right,
      };
    },
    [RIGHT_OFFSET],
  );

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={{
          uri:
                        `${faker.image.nature(PAGE_WIDTH, PAGE_HEIGHT)
                        }?random=${
                          Math.random()}`,
        }}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          position: "absolute",
        }}
      />
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          position: "absolute",
        }}
      />
      <Carousel
        loop
        vertical
        style={{
          justifyContent: "center",
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
        }}
        width={ITEM_WIDTH}
        pagingEnabled={false}
        height={ITEM_HEIGHT}
        data={[...new Array(10).keys()]}
        renderItem={({ index }) => {
          return (
            <View key={index} style={{ flex: 1, padding: 10 }}>
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
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      marginRight: 5,
                    }}
                    source={{
                      uri:
                                                `${faker.image.animals(20, 20)
                                                }?random=${
                                                  Math.random()}`,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      maxWidth: ITEM_WIDTH * 0.3 - 40,
                      color: "white",
                    }}
                  >
                    {faker.animal.dog()}
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
                  <Image
                    style={{
                      width: ITEM_WIDTH * 0.6,
                      height: ITEM_HEIGHT - 20,
                      borderRadius: 10,
                      marginRight: 5,
                    }}
                    source={{
                      uri:
                                                `${faker.image.nature(
                                                  Math.round(
                                                    ITEM_WIDTH * 0.6,
                                                  ),
                                                  ITEM_HEIGHT - 20,
                                                )
                                                }?random=${
                                                  Math.random()}`,
                    }}
                  />
                </View>
              </View>
            </View>
          );
        }}
        customAnimation={animationStyle}
      />
    </View>
  );
}

export default Index;
