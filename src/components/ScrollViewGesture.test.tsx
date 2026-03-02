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
      // Simulate upstream web behavior that reads `element.ref`.
      // If the child element carries a ref, React 19 emits the warning.
      // @ts-expect-error React 19 removed `element.ref` from the element type.
      void child.ref;
      return child;
    },
  };
});

describe("ScrollViewGesture", () => {
  it("does not emit React 19 `element.ref` warning", () => {
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
