import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import type { ICarouselInstance } from "../../../../src/types";
import SButton from "../../components/SButton";
import { window } from "../../constants";

const PAGE_WIDTH = window.width;

function Index() {
  const r = React.useRef<ICarouselInstance | null>(null);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f1f1f1",
        paddingTop: 100,
      }}
    >
      <View style={{ width: PAGE_WIDTH, height: 240 }}>
        <Carousel
          defaultIndex={0}
          ref={r}
          width={PAGE_WIDTH}
          data={[...new Array(50).keys()]}
          mode="parallax"
          windowSize={3}
          renderItem={({ index }) => (
            <View
              key={index}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ff7a45",
                padding: 16,
              }}
            >
              <Text style={{ color: "white", fontSize: 30 }}>
                {`index:${index}`}
              </Text>
              <ScrollView style={{ width: "100%" }}>
                {new Array(100).fill(0).map((_, i) => {
                  return (
                    <View
                      key={i}
                      style={{
                        borderWidth: 1,
                        borderColor: "#0000001a",
                        padding: 16,
                      }}
                    >
                      <Text>{i}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        />
      </View>
      <View
        style={{
          marginTop: 24,
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <SButton onPress={() => r.current?.prev()}>{"Prev"}</SButton>
        <SButton onPress={() => r.current?.next()}>{"Next"}</SButton>
      </View>
    </View>
  );
}

export default Index;
