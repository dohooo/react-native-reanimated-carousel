import React from "react";
import { View } from "react-native";

import { render } from "@testing-library/react-native";

import { ScrollViewGesture } from "./ScrollViewGesture";

import { GlobalStateContext } from "../store";

jest.mock("../hooks/usePanGestureProxy", () => ({
  usePanGestureProxy: jest.fn(() => ({})),
}));

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

describe("issue #857 web regression", () => {
  it("does not emit the React 19 element.ref warning from the gesture path", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const contextValue = {
      props: {
        onConfigurePanGesture: undefined,
        vertical: false,
        pagingEnabled: true,
        snapEnabled: true,
        loop: false,
        scrollAnimationDuration: 500,
        withAnimation: undefined,
        enabled: true,
        dataLength: 3,
        overscrollEnabled: false,
        maxScrollDistancePerSwipe: undefined,
        minScrollDistancePerSwipe: undefined,
        fixedDirection: undefined,
      },
      common: {
        size: 300,
        validLength: 2,
        handlerOffset: { value: 0 },
        resolvedSize: { value: 300 },
        sizePhase: { value: "ready" },
        sizeExplicit: true,
      },
      layout: {
        containerSize: { value: { width: 300, height: 200 } },
        updateContainerSize: jest.fn(),
        itemDimensions: { value: {} },
        updateItemDimensions: jest.fn(),
      },
    };

    render(
      <GlobalStateContext.Provider value={contextValue as any}>
        <ScrollViewGesture
          size={300}
          translation={{ value: 0 } as any}
          style={{ width: 300, height: 200 }}
        >
          <View testID="content" />
        </ScrollViewGesture>
      </GlobalStateContext.Provider>
    );

    const react19RefWarnings = errorSpy.mock.calls.filter(([message]) =>
      String(message).includes("Accessing element.ref was removed in React 19")
    );

    expect(react19RefWarnings).toHaveLength(0);
    errorSpy.mockRestore();
  });
});
