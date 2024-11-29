import * as React from "react";
import { Text, View } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

import { window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";

const PAGE_WIDTH = window.width / 2;

function ReactionContainer(props: {
  text: string;
  children: (text: React.ReactElement, layout?: { width: number }) => React.ReactElement;
}) {
  const [width, setWidth] = React.useState<number>();
  const [layout, setLayout] = React.useState<{ width: number }>();

  React.useEffect(() => {
    if (typeof width === "number") setLayout({ width });
  }, [width]);

  React.useEffect(() => {
    setLayout(undefined);
  }, [props.text]);

  const text = (
    <Animated.View
      style={[
        {
          flexWrap: "wrap",
          width: layout?.width,
        },
      ]}
    >
      <Text
        style={{ color: "white" }}
        onLayout={({ nativeEvent }) => {
          if (typeof layout === "undefined") setWidth(nativeEvent.layout.width);
        }}
      >
        {props.text}
      </Text>
    </Animated.View>
  );

  return React.cloneElement(props.children(text, layout), {
    key: props.text,
  });
}

function Index() {
  return (
    <View style={{ backgroundColor: "black", height: 200 }}>
      <ReactionContainer text="This is a piece of text that will play in a loop...">
        {(text, layout) => {
          return (
            <View
              style={{
                alignItems: "center",
                flex: 1,
                marginTop: 72,
              }}
            >
              <Carousel
                width={layout?.width ?? PAGE_WIDTH}
                height={30}
                style={[
                  {
                    width: 200,
                  },
                ]}
                snapEnabled={false}
                pagingEnabled={false}
                loop
                autoPlay
                withAnimation={{
                  type: "timing",
                  config: {
                    duration: 10000,
                    easing: Easing.linear,
                  },
                }}
                autoPlayInterval={0}
                data={[...new Array(6).keys()]}
                renderItem={() => text}
                enabled={false}
              />
            </View>
          );
        }}
      </ReactionContainer>
    </View>
  );
}

export default Index;
