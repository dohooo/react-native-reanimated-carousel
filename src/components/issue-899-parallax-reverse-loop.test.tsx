import React from "react";
import { StyleSheet } from "react-native";
import type { PanGesture } from "react-native-gesture-handler";
import { Gesture, State } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { act, render, waitFor } from "@testing-library/react-native";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import { Carousel } from "./Carousel";

{
  const cfg = (global as any).__reanimatedLoggerConfig as
    | { logFunction: (data: { level: number; message: string }) => void }
    | undefined;
  if (cfg) {
    const originalLog = cfg.logFunction;
    cfg.logFunction = (data) => {
      if (data.message.includes("measure() cannot be used with Jest")) return;
      originalLog(data);
    };
  }
}

const slideWidth = 300;
const slideHeight = 200;
const gestureTestId = "rnrc-gesture-handler";
const realPan = Gesture.Pan();

jest.spyOn(Gesture, "Pan").mockImplementation(() => realPan.withTestId(gestureTestId));

describe("issue #899 parallax reverse loop regression", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it("preserves renderItem styles and props when looping backward from index 0 in parallax mode", async () => {
    const data = Array.from({ length: 30 }, (_, index) => ({
      id: `item-${index}`,
      color: index === 29 ? "#111111" : `rgb(${index}, ${index}, ${index})`,
    }));

    const { getByTestId } = render(
      <Carousel
        data={data}
        defaultIndex={0}
        loop
        layout={{ type: "parallax" }}
        renderWindowSize={5}
        style={{ width: slideWidth, height: slideHeight }}
        renderItem={({ item, index }) => (
          <Animated.View
            testID={`issue-899-item-${index}`}
            accessibilityLabel={`issue-899-label-${index}`}
            style={{
              width: slideWidth,
              height: slideHeight,
              backgroundColor: item.color,
            }}
          />
        )}
      />
    );

    await waitFor(() => {
      expect(getByTestId("issue-899-item-0")).toBeTruthy();
    });

    const prerenderedWrappedItem = getByTestId("issue-899-item-29");
    const prerenderedWrappedStyle = StyleSheet.flatten(prerenderedWrappedItem.props.style);

    expect(prerenderedWrappedItem.props.accessibilityLabel).toBe("issue-899-label-29");
    expect(prerenderedWrappedStyle.backgroundColor).toBe("#111111");

    fireGestureHandler<PanGesture>(getByGestureTestId(gestureTestId), [
      { state: State.BEGAN, translationX: 0, velocityX: slideWidth },
      { state: State.ACTIVE, translationX: slideWidth * 0.7, velocityX: slideWidth },
    ]);

    const wrappedItem = getByTestId("issue-899-item-29");
    const flattenedStyle = StyleSheet.flatten(wrappedItem.props.style);

    expect(wrappedItem.props.accessibilityLabel).toBe("issue-899-label-29");
    expect(flattenedStyle.backgroundColor).toBe("#111111");
  });
});
