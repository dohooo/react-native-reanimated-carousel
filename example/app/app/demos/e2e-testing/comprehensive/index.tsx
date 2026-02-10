import { SlideItem } from "@/components/SlideItem";
import { window } from "@/constants/sizes";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const SCREEN_WIDTH = window.width;
const CAROUSEL_HEIGHT = 200;

const COLORS = ["#B0604D", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"];

type LayoutMode = "normal" | "parallax" | "horizontal-stack" | "vertical-stack";

function ToggleButton({
  testID,
  label,
  value,
  onPress,
}: {
  testID: string;
  label: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.toggleButton, value && styles.toggleActive]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, value && styles.activeText]}>
        {`${label}: ${value ? "ON" : "OFF"}`}
      </Text>
    </TouchableOpacity>
  );
}

const carouselRenderItem = ({
  index,
}: {
  index: number;
}) => <SlideItem index={index} rounded />;

export default function ComprehensiveE2E() {
  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [mode, setMode] = useState<LayoutMode>("normal");
  const [loop, setLoop] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayReverse, setAutoPlayReverse] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [pagingEnabled, setPagingEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [carouselVisible, setCarouselVisible] = useState(true);
  const [dataCount, setDataCount] = useState(6);

  const data = useMemo(
    () => Array.from({ length: dataCount }, (_, i) => COLORS[i % COLORS.length]),
    [dataCount]
  );

  const modeConfig = useMemo(() => {
    switch (mode) {
      case "parallax":
        return {
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        };
      case "horizontal-stack":
      case "vertical-stack":
        return {
          snapDirection: "left" as const,
          stackInterval: 18,
        };
      default:
        return undefined;
    }
  }, [mode]);

  const isStackMode = mode === "horizontal-stack" || mode === "vertical-stack";

  const carouselStyle = useMemo(() => {
    if (isStackMode) {
      return { width: 280, height: 210 };
    }
    return { width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT };
  }, [isStackMode]);

  const navigateTo = useCallback((index: number) => {
    carouselRef.current?.scrollTo({
      count: index - Math.round(progress.value),
      animated: true,
    });
  }, []);

  const handleModeChange = useCallback((newMode: LayoutMode) => {
    setMode(newMode);
    setCurrentIndex(0);
  }, []);

  const handleDataCountChange = useCallback((count: number) => {
    setDataCount(count);
    setCurrentIndex(0);
  }, []);

  const handleReset = useCallback(() => {
    setMode("normal");
    setLoop(true);
    setAutoPlay(false);
    setAutoPlayReverse(false);
    setVertical(false);
    setEnabled(true);
    setPagingEnabled(true);
    setSnapEnabled(true);
    setCarouselVisible(true);
    setDataCount(6);
    setCurrentIndex(0);
  }, []);

  return (
    <ScrollView style={styles.container} testID="e2e-scroll-view">
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text testID="e2e-current-index" style={styles.statusText}>
          {`Current Index: ${currentIndex}`}
        </Text>
        <Text testID="e2e-current-mode" style={styles.statusText}>
          {`Mode: ${mode}`}
        </Text>
        <Text testID="e2e-display-state" style={styles.statusText}>
          {`Display: ${carouselVisible ? "flex" : "none"}`}
        </Text>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <View testID="e2e-display-wrapper" style={{ display: carouselVisible ? "flex" : "none" }}>
          <Carousel
            key={`${mode}-${vertical}-${dataCount}`}
            ref={carouselRef}
            testID="e2e-carousel"
            data={data}
            renderItem={carouselRenderItem}
            style={carouselStyle}
            mode={mode === "normal" ? undefined : mode}
            modeConfig={modeConfig}
            loop={loop}
            autoPlay={autoPlay}
            autoPlayReverse={autoPlayReverse}
            autoPlayInterval={2000}
            vertical={vertical}
            enabled={enabled}
            pagingEnabled={pagingEnabled}
            snapEnabled={snapEnabled}
            onSnapToItem={setCurrentIndex}
            onProgressChange={(_, absoluteProgress) => {
              progress.value = absoluteProgress;
            }}
            {...(isStackMode
              ? {
                  customConfig: () => ({
                    type: "positive" as const,
                    viewCount: 5,
                  }),
                }
              : {})}
          />
        </View>
      </View>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer} testID="e2e-pagination">
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            testID={`pagination-dot-${index}`}
            onPress={() => navigateTo(index)}
            style={[styles.paginationDot, currentIndex === index && styles.paginationDotActive]}
          >
            <Text style={[styles.paginationDotText, currentIndex !== index && { color: "#666" }]}>
              {index}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <View style={styles.row}>
          <TouchableOpacity
            testID="btn-prev"
            style={styles.button}
            onPress={() => carouselRef.current?.prev({ animated: true })}
          >
            <Text style={styles.navButtonText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="btn-next"
            style={styles.button}
            onPress={() => carouselRef.current?.next({ animated: true })}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="btn-reset"
            style={[styles.button, { backgroundColor: "#FF6B6B" }]}
            onPress={handleReset}
          >
            <Text style={styles.navButtonText}>Reset All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="btn-toggle-display"
            style={[styles.button, { backgroundColor: "#9C88FF" }]}
            onPress={() => setCarouselVisible((prev) => !prev)}
          >
            <Text style={styles.navButtonText}>{carouselVisible ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          {data.map((_, index) => (
            <TouchableOpacity
              key={index}
              testID={`btn-goto-${index}`}
              style={styles.smallButton}
              onPress={() => navigateTo(index)}
            >
              <Text style={styles.buttonText}>{`GoTo ${index}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Layout Mode Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layout Mode</Text>
        <View style={styles.row}>
          {(["normal", "parallax", "horizontal-stack", "vertical-stack"] as LayoutMode[]).map(
            (m) => (
              <TouchableOpacity
                key={m}
                testID={`btn-mode-${m}`}
                style={[styles.smallButton, mode === m && styles.activeButton]}
                onPress={() => handleModeChange(m)}
              >
                <Text style={[styles.buttonText, mode === m && styles.activeText]}>
                  {m === "horizontal-stack"
                    ? "HStack"
                    : m === "vertical-stack"
                      ? "VStack"
                      : m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Toggle Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.row}>
          <ToggleButton
            testID="btn-loop"
            label="Loop"
            value={loop}
            onPress={() => setLoop(!loop)}
          />
          <ToggleButton
            testID="btn-autoplay"
            label="Auto"
            value={autoPlay}
            onPress={() => setAutoPlay(!autoPlay)}
          />
        </View>
        <View style={styles.row}>
          <ToggleButton
            testID="btn-vertical"
            label="Vert"
            value={vertical}
            onPress={() => {
              setVertical(!vertical);
              setCurrentIndex(0);
            }}
          />
          <ToggleButton
            testID="btn-enabled"
            label="Enabled"
            value={enabled}
            onPress={() => setEnabled(!enabled)}
          />
        </View>
        <View style={styles.row}>
          <ToggleButton
            testID="btn-paging"
            label="Paging"
            value={pagingEnabled}
            onPress={() => setPagingEnabled(!pagingEnabled)}
          />
          <ToggleButton
            testID="btn-snap"
            label="Snap"
            value={snapEnabled}
            onPress={() => setSnapEnabled(!snapEnabled)}
          />
        </View>
        <View style={styles.row}>
          <ToggleButton
            testID="btn-autoplay-reverse"
            label="AutoRev"
            value={autoPlayReverse}
            onPress={() => setAutoPlayReverse(!autoPlayReverse)}
          />
        </View>
      </View>

      {/* Data Count Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Count</Text>
        <View style={styles.row}>
          {[1, 2, 3, 6, 10].map((count) => (
            <TouchableOpacity
              key={count}
              testID={`btn-data-${count}`}
              style={[styles.smallButton, dataCount === count && styles.activeButton]}
              onPress={() => handleDataCountChange(count)}
            >
              <Text style={[styles.buttonText, dataCount === count && styles.activeText]}>
                {`${count} items`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Status (always visible regardless of scroll position) */}
      <View style={styles.bottomStatus}>
        <Text testID="e2e-bottom-index" style={styles.statusText}>
          {`Index: ${currentIndex}`}
        </Text>
        <Text style={styles.statusText}>{`| ${mode}`}</Text>
        <Text style={styles.statusText}>{`| ${loop ? "loop" : "no-loop"}`}</Text>
        <Text style={styles.statusText}>{`| ${vertical ? "vert" : "horiz"}`}</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  carouselContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 10,
  },
  paginationDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDotActive: {
    backgroundColor: "#333",
  },
  paginationDotText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
  },
  navButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  bottomStatus: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    padding: 8,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
  },
});
