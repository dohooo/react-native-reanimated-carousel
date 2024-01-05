import * as React from "react";
import { ScrollView } from "react-native-gesture-handler";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { getImages } from "../../utils/get-images";


import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";
import { useWindowDimensions, View, Image, StyleSheet } from "react-native";
import  Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const PAGE_WIDTH = window.width;
const PAGE_HEIGHT = window.height * 0.3;

const data = getImages();

function Index() {
  const windowWidth = useWindowDimensions().width;
  const scrollOffsetValue = useSharedValue<number>(0);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = {
      vertical: false,
      width: windowWidth * 0.5,
      height: PAGE_WIDTH / 1.5,
    } as const;

  //* Custom animation
  const scrollX = useSharedValue<number>(0);

  const onScroll = (e: any) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

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
        autoPlay={isAutoPlay}
        data={data}
        onConfigurePanGesture={g => g.enabled(false)}
        onSnapToItem={(elem: any) => console.log("current element:", elem)}
        renderItem={({ index, item }: any) => (
          <Item
            key={index}
            img={item}
          />
        )}
      />
      <View style={{ flex: 1 }}>
        <SButton
          onPress={() => {
            setIsAutoPlay(!isAutoPlay);
          }}
        >
          {ElementsText.AUTOPLAY}:{`${isAutoPlay}`}
        </SButton>
        <SButton
          onPress={() => {
            ref.current?.scrollTo({ count: -1, animated: true });
          }}
        >
          prev
        </SButton>
        <SButton
          onPress={() => {
            ref.current?.scrollTo({ count: 1, animated: true });
          }}
        >
          next
        </SButton>
      </View>
    </SafeAreaView>
  );
}

const Item: React.FC<{ img: ImageSourcePropType }> = ({ img }) => {
  const animatedStyle = useAnimatedStyle(() => ({}));

  return (
        <View style={styles.container}>
            <Animated.Image 
                source={img} 
                style={[ styles.image, animatedStyle]} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginVertical: 10,
    },
    image: {
      width: PAGE_WIDTH * 0.5,
      height: 250,
      borderRadius: 20,
    }
});

export default Index;
