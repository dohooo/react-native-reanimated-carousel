import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";
import Carousel from "react-native-reanimated-carousel";

describe("issue #862", () => {
  it("renders carousel items in the Expo SDK 54 / RN 0.81 Jest environment", () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <Carousel
          testID="issue-862-carousel"
          style={{ width: 320, height: 180 }}
          data={["A", "B", "C"]}
          renderItem={({ index }) => (
            <Text testID={`issue-862-item-${index}`}>{`Slide ${index}`}</Text>
          )}
        />
      );
    });

    expect(tree!.root.findAllByProps({ testID: "issue-862-item-0" }).length).toBeGreaterThan(0);
    expect(
      tree!
        .root
        .findAllByType(Text)
        .some((node) => node.props.children === "Slide 0")
    ).toBe(true);
  });
});
