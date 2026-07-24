import { useRef, useState } from "react";
import { Button, type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Carousel, type CarouselRef } from "react-native-reanimated-carousel";

const DATA = ["#B0604D", "#899F9C"];

export default function App() {
  const carouselRef = useRef<CarouselRef>(null);
  const [parentWidth, setParentWidth] = useState(280);
  const [itemSize, setItemWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const measureItem = (event: LayoutChangeEvent) => {
    setItemWidth(Math.round(event.nativeEvent.layout.width));
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <Text style={styles.title}>Packed Package Smoke</Text>
      <Text testID="status">{`Index: ${index}; Item Width: ${itemSize}`}</Text>
      <View testID="parent" style={{ width: parentWidth, height: 180 }}>
        <Carousel
          ref={carouselRef}
          data={DATA}
          loop
          renderWindowSize={5}
          style={styles.carousel}
          testID="carousel"
          onSnapToItem={setIndex}
          renderItem={({ index: itemIndex, item }) => (
            <View
              testID={`slide-${itemIndex}`}
              style={[styles.slide, { backgroundColor: item }]}
              onLayout={measureItem}
            >
              <Text style={styles.slideText}>{`Slide ${itemIndex}`}</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.controls}>
        <Button
          testID="next"
          title="Next"
          onPress={() => carouselRef.current?.next({ animated: false })}
        />
        <Button
          testID="resize"
          title="Resize"
          onPress={() => setParentWidth((width) => (width === 280 ? 340 : 280))}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  carousel: {
    height: 180,
  },
  slide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  slideText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  controls: {
    flexDirection: "row",
    gap: 16,
  },
});
