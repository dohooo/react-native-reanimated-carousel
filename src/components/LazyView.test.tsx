import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { LazyView } from "./LazyView";

describe("LazyView", () => {
  it("should render children when shouldUpdate is true", () => {
    const { getByText } = render(
      <LazyView shouldUpdate={true}>
        <Text>Test Child</Text>
      </LazyView>
    );

    expect(getByText("Test Child")).toBeTruthy();
  });

  it("should not render children when shouldUpdate is false", () => {
    const { queryByText } = render(
      <LazyView shouldUpdate={false}>
        <Text>Test Child</Text>
      </LazyView>
    );

    expect(queryByText("Test Child")).toBeNull();
  });

  it("should render empty fragment when shouldUpdate is false", () => {
    const { container } = render(
      <LazyView shouldUpdate={false}>
        <Text>Test Child</Text>
      </LazyView>
    );

    expect(container.children.length).toBe(0);
  });

  it("should handle multiple children when shouldUpdate is true", () => {
    const { getByText } = render(
      <LazyView shouldUpdate={true}>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </LazyView>
    );

    expect(getByText("First Child")).toBeTruthy();
    expect(getByText("Second Child")).toBeTruthy();
  });

  it("should not render multiple children when shouldUpdate is false", () => {
    const { queryByText } = render(
      <LazyView shouldUpdate={false}>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </LazyView>
    );

    expect(queryByText("First Child")).toBeNull();
    expect(queryByText("Second Child")).toBeNull();
  });
});
