import React, { useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel, { type ICarouselInstance } from "react-native-reanimated-carousel";

const DATA = ["#B0604D", "#899F9C"];

function normalizeIndex(absoluteProgress: number) {
  const rounded = Math.round(absoluteProgress);
  return ((rounded % DATA.length) + DATA.length) % DATA.length;
}

function ControlButton({
  testID,
  label,
  onPress,
}: {
  testID: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity testID={testID} style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function WebReleaseSmoke() {
  const horizontalRef = useRef<ICarouselInstance>(null);
  const verticalRef = useRef<ICarouselInstance>(null);
  const [horizontalWidth, setHorizontalWidth] = useState(320);
  const [verticalHeight, setVerticalHeight] = useState(240);
  const [horizontalIndex, setHorizontalIndex] = useState(0);
  const [verticalIndex, setVerticalIndex] = useState(0);
  const [horizontalItemWidth, setHorizontalItemWidth] = useState(0);
  const [verticalItemHeight, setVerticalItemHeight] = useState(0);

  const measureHorizontalItem = (event: LayoutChangeEvent) => {
    setHorizontalItemWidth(Math.round(event.nativeEvent.layout.width));
  };

  const measureVerticalItem = (event: LayoutChangeEvent) => {
    setVerticalItemHeight(Math.round(event.nativeEvent.layout.height));
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Web Release Smoke</Text>

      <View style={styles.section}>
        <Text testID="horizontal-index" style={styles.status}>
          {`Horizontal Index: ${horizontalIndex}`}
        </Text>
        <View testID="horizontal-parent" style={{ width: horizontalWidth, height: 180 }}>
          <Carousel
            ref={horizontalRef}
            testID="horizontal-carousel"
            data={DATA}
            loop
            windowSize={5}
            style={styles.horizontalCarousel}
            onProgressChange={(_offsetProgress, absoluteProgress) =>
              setHorizontalIndex(normalizeIndex(absoluteProgress))
            }
            renderItem={({ index, item }) => (
              <View
                testID={`horizontal-slide-${index}`}
                style={[styles.slide, { backgroundColor: item }]}
                onLayout={measureHorizontalItem}
              >
                <Text style={styles.slideText}>{`Horizontal Slide ${index}`}</Text>
              </View>
            )}
          />
        </View>
        <Text testID="horizontal-item-width" style={styles.measurement}>
          {`Horizontal Item Width: ${horizontalItemWidth}`}
        </Text>
        <View style={styles.controls}>
          <ControlButton
            testID="horizontal-next"
            label="Horizontal Next"
            onPress={() => horizontalRef.current?.next({ animated: false })}
          />
          <ControlButton
            testID="horizontal-resize"
            label="Resize Horizontal"
            onPress={() => setHorizontalWidth((width) => (width === 320 ? 520 : 320))}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text testID="vertical-index" style={styles.status}>
          {`Vertical Index: ${verticalIndex}`}
        </Text>
        <View testID="vertical-parent" style={{ width: 240, height: verticalHeight }}>
          <Carousel
            ref={verticalRef}
            testID="vertical-carousel"
            data={DATA}
            loop
            vertical
            windowSize={5}
            style={styles.verticalCarousel}
            onProgressChange={(_offsetProgress, absoluteProgress) =>
              setVerticalIndex(normalizeIndex(absoluteProgress))
            }
            renderItem={({ index, item }) => (
              <View
                testID={`vertical-slide-${index}`}
                style={[styles.slide, { backgroundColor: item }]}
                onLayout={measureVerticalItem}
              >
                <Text style={styles.slideText}>{`Vertical Slide ${index}`}</Text>
              </View>
            )}
          />
        </View>
        <Text testID="vertical-item-height" style={styles.measurement}>
          {`Vertical Item Height: ${verticalItemHeight}`}
        </Text>
        <View style={styles.controls}>
          <ControlButton
            testID="vertical-next"
            label="Vertical Next"
            onPress={() => verticalRef.current?.next({ animated: false })}
          />
          <ControlButton
            testID="vertical-resize"
            label="Resize Vertical"
            onPress={() => setVerticalHeight((height) => (height === 240 ? 420 : 240))}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    gap: 32,
    padding: 24,
  },
  title: {
    color: "#111",
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    alignItems: "flex-start",
    gap: 12,
  },
  status: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
  measurement: {
    color: "#333",
    fontSize: 14,
  },
  horizontalCarousel: {
    height: 180,
  },
  verticalCarousel: {
    flex: 1,
    width: 240,
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
    gap: 12,
  },
  button: {
    backgroundColor: "#4A67D6",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
