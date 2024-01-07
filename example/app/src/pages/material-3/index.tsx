import * as React from "react";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { getImages } from "../../utils/get-images";

import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";
import { useWindowDimensions, View, FlatList, StyleSheet } from "react-native";
import  Animated, { Extrapolation, interpolate, useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const PAGE_WIDTH = window.width;
const LARGE_IMAGE_WIDTH = PAGE_WIDTH * 0.5;
const MEDIUM_IMAGE_WIDTH = LARGE_IMAGE_WIDTH * 0.5;
const SMALL_IMAGE_WIDTH = MEDIUM_IMAGE_WIDTH * 0.5;
const COUNT = 3;

const data = getImages();

function Index() {
  const windowWidth = useWindowDimensions().width;
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = {
      vertical: false,
      width: windowWidth * 0.45,
      height: PAGE_WIDTH / 1.5,
      style: {
        width: PAGE_WIDTH,
      }
    } as const;

  //* Custom animation
  const scrollX = useSharedValue<number>(0);

  const onScroll = (offsetProgress: number) => {
    scrollX.value = offsetProgress * -1;
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        {/* <FlatList 
            horizontal
            style={{ width: "100%" }}
            data={data}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showHorizontalScrollIndicator={false}
            renderItem={({ index, item }: any) => (
                <Item
                    id={index}
                    img={item}
                    scrollX={scrollX}
                />
            )}
        /> */}
      <Carousel
        {...baseOptions}
        loop
        enabled // Default is true, just for demo
        ref={ref}
        autoPlay={isAutoPlay}
        data={data}
        onProgressChange={onScroll}
        renderItem={({ index, item }: any) => (
          <Item
            id={index}
            img={item}
            scrollX={scrollX}
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

const Item = ({ id, img, scrollX }: { id: number, img: ImageSourcePropType, scrollX: any }) => {
    const inputRange = [
        (id - 2) * SMALL_IMAGE_WIDTH, 
        (id - 1) * SMALL_IMAGE_WIDTH,
        id * SMALL_IMAGE_WIDTH, 
        (id + 1) * SMALL_IMAGE_WIDTH
    ];

    const outputRange = [
        SMALL_IMAGE_WIDTH,
        MEDIUM_IMAGE_WIDTH,
        LARGE_IMAGE_WIDTH,
        SMALL_IMAGE_WIDTH
    ];
    
    const animatedStyle = useAnimatedStyle(() => ({
        width: interpolate(scrollX.value, inputRange, outputRange, Extrapolation.CLAMP)
    }));

  return (
    <View style={styles.container}>
        <Animated.Image 
            source={img} 
            style={[styles.image, animatedStyle]} 
        />
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    image: {
      width: PAGE_WIDTH,
      height: 250,
      borderRadius: 20,
      marginRight: 10
    }
});

export default Index;
