import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import Carousel from "react-native-snap-carousel";

import SButton from "../../components/SButton";
import { window } from "../../constants";

const PAGE_WIDTH = window.width;

function Index() {
  const r = React.useRef<Carousel<any>>(null);

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
          ref={r}
          loop
          itemWidth={PAGE_WIDTH}
          sliderWidth={PAGE_WIDTH}
          data={[...new Array(50).keys()]}
          windowSize={3}
          renderItem={({ index }: { index: number }) => (
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
        <SButton onPress={() => r.current?.snapToPrev()}>
          {"Prev"}
        </SButton>
        <SButton onPress={() => r.current?.snapToNext()}>
          {"Next"}
        </SButton>
      </View>
    </View>
  );
}

export default Index;
