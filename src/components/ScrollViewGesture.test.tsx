import React from "react";
import { View } from "react-native";
import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";

import { act, render } from "@testing-library/react-native";

import { ScrollViewGesture } from "./ScrollViewGesture";

import { usePanGestureProxy } from "../hooks/usePanGestureProxy";
import { type CarouselContext, GlobalStateContext } from "../store";

jest.mock("../hooks/usePanGestureProxy", () => ({
  usePanGestureProxy: jest.fn(() => ({})),
}));

const mockUsePanGestureProxy = jest.mocked(usePanGestureProxy);

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const actual = jest.requireActual("react-native-gesture-handler");

  return {
    ...actual,
    GestureDetector: ({ children }: { children: React.ReactNode }) => {
      const child = React.Children.only(children);

      // Simulate the upstream web path that reads `element.ref`.
      // React 19 warns only when the child element actually carries a ref.
      // @ts-expect-error React 19 removed `element.ref` from the element type.
      void child.ref;

      return child;
    },
  };
});

type RenderGestureOptions = {
  vertical?: boolean;
  rtl?: boolean;
  size?: number;
  dataLength?: number;
  containerSize?: { width: number; height: number };
};

function renderGesture({
  vertical = false,
  rtl = false,
  size = 300,
  dataLength = 3,
  containerSize = { width: 300, height: 200 },
}: RenderGestureOptions = {}) {
  const translation = { value: 0 } as SharedValue<number>;
  const contextValue = {
    props: {
      onConfigurePanGesture: undefined,
      orientation: vertical ? "vertical" : "horizontal",
      directionSign: !vertical && rtl ? -1 : 1,
      snapMode: "page",
      loop: false,
      animation: { type: "timing", duration: 500 },
      scrollEnabled: true,
      dataLength,
      overscrollEnabled: false,
    },
    common: {
      size,
      validLength: dataLength,
      handlerOffset: { value: 0 },
      resolvedSize: { value: size },
      sizePhase: { value: "ready" },
      sizeExplicit: true,
      isMoving: { value: false },
      startMovement: jest.fn(),
      cancelMovement: jest.fn(),
      settleMovement: jest.fn(),
    },
    layout: {
      containerSize: { value: containerSize },
      updateContainerSize: jest.fn(),
      itemDimensions: { value: {} },
      updateItemDimensions: jest.fn(),
    },
  } as unknown as CarouselContext;

  render(
    <GlobalStateContext.Provider value={contextValue}>
      <ScrollViewGesture size={size} translation={translation} style={containerSize}>
        <View testID="content" />
      </ScrollViewGesture>
    </GlobalStateContext.Provider>
  );

  const gestureCallbacks =
    mockUsePanGestureProxy.mock.calls[mockUsePanGestureProxy.mock.calls.length - 1]?.[0];

  if (!gestureCallbacks) {
    throw new Error("Expected ScrollViewGesture to configure the pan gesture");
  }

  return { gestureCallbacks, translation };
}

describe("issue #857 web regression", () => {
  beforeEach(() => {
    mockUsePanGestureProxy.mockClear();
  });

  it("does not emit the React 19 element.ref warning from the gesture path", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      renderGesture();

      const react19RefWarnings = errorSpy.mock.calls.filter(([message]) =>
        String(message).includes("Accessing element.ref was removed in React 19")
      );

      expect(react19RefWarnings).toHaveLength(0);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it.each([
    ["horizontal", false, 300, 3, { width: 300, height: 200 }, -600],
    ["vertical", true, 300, 3, { width: 300, height: 200 }, -700],
    ["unmeasured container", false, 300, 3, { width: 0, height: 0 }, 0],
    ["content smaller than its container", false, 100, 2, { width: 300, height: 200 }, 0],
  ] as const)(
    "uses the %s main-axis container size for the non-loop boundary",
    (_name, vertical, size, dataLength, containerSize, expectedTranslation) => {
      const { gestureCallbacks, translation } = renderGesture({
        vertical,
        size,
        dataLength,
        containerSize,
      });

      act(() => {
        gestureCallbacks.onGestureStart(
          {} as GestureStateChangeEvent<PanGestureHandlerEventPayload>
        );
        gestureCallbacks.onGestureUpdate({
          translationX: -1000,
          translationY: -1000,
        } as GestureUpdateEvent<PanGestureHandlerEventPayload>);
      });

      expect(translation.value).toBeCloseTo(expectedTranslation);
    }
  );

  it("maps a physical rightward RTL swipe to logical forward movement", () => {
    const { gestureCallbacks, translation } = renderGesture({ rtl: true });

    act(() => {
      gestureCallbacks.onGestureStart({} as GestureStateChangeEvent<PanGestureHandlerEventPayload>);
      gestureCallbacks.onGestureUpdate({
        translationX: 180,
        translationY: -250,
      } as GestureUpdateEvent<PanGestureHandlerEventPayload>);
    });

    expect(translation.value).toBe(-180);
  });

  it("does not apply horizontal RTL mapping to vertical gestures", () => {
    const { gestureCallbacks, translation } = renderGesture({ rtl: true, vertical: true });

    act(() => {
      gestureCallbacks.onGestureStart({} as GestureStateChangeEvent<PanGestureHandlerEventPayload>);
      gestureCallbacks.onGestureUpdate({
        translationX: 180,
        translationY: -180,
      } as GestureUpdateEvent<PanGestureHandlerEventPayload>);
    });

    expect(translation.value).toBe(-180);
  });
});
