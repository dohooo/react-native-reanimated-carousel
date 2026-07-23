import React from "react";
import { View } from "react-native";

import { render } from "@testing-library/react-native";

import { Carousel } from "./Carousel";

jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual("react-native-gesture-handler");
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");

  return {
    ...actual,
    GestureHandlerRootView: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(
        View,
        { ...props, accessibilityLabel: "nested-gesture-handler-root" },
        children
      ),
  };
});

jest.mock("./ItemRenderer", () => ({ ItemRenderer: () => null }));

describe("Carousel gesture-handler root", () => {
  it("relies on the root configured by the application", async () => {
    const screen = render(
      <Carousel
        data={["A"]}
        renderItem={({ index }) => <View testID={`carousel-item-${index}`} />}
        style={{ width: 300, height: 200 }}
      />
    );

    expect(screen.queryByLabelText("nested-gesture-handler-root")).toBeNull();
  });
});
