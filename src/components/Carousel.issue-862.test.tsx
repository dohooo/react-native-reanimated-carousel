import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import Carousel from "./Carousel";

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

describe("issue #862 carousel items render in tests", () => {
  it("renders carousel items and text nodes, not only the wrapper", async () => {
    const data = ["A", "B", "C"];
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(
        <Carousel
          testID="issue-862-carousel"
          style={{ width: 320, height: 180 }}
          data={data}
          renderItem={({ item, index }) => (
            <Text testID={`issue-862-item-${item}`}>{`Slide ${index}: ${item}`}</Text>
          )}
        />
      );
      await Promise.resolve();
    });

    expect(tree.root.findAllByProps({ testID: "issue-862-carousel" }).length).toBeGreaterThan(0);

    for (const [index, item] of data.entries()) {
      expect(tree.root.findAllByProps({ testID: `issue-862-item-${item}` }).length).toBeGreaterThan(0);
      expect(
        tree.root.findAllByType(Text).some((node) => node.props.children === `Slide ${index}: ${item}`)
      ).toBe(true);
    }

    await act(async () => {
      tree.unmount();
      await Promise.resolve();
    });
  });
});
