import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { GlobalStateContext, GlobalStateProvider, useGlobalState } from "./index";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  useSharedValue: jest.fn((initialValue) => ({
    value: initialValue,
  })),
}));

describe("GlobalStateProvider", () => {
  const mockProps = {
    width: 300,
    height: 200,
    data: [1, 2, 3],
    renderItem: () => <Text>Item</Text>,
  } as any;

  const mockCommon = {
    size: 300,
    validLength: 3,
  };

  const mockValue = {
    props: mockProps,
    common: mockCommon,
  };

  it("should render children correctly", () => {
    const { getByText } = render(
      <GlobalStateProvider value={mockValue}>
        <Text>Test Child</Text>
      </GlobalStateProvider>
    );

    expect(getByText("Test Child")).toBeTruthy();
  });

  it("should provide context value with layout methods", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(contextValue).toHaveProperty("props");
    expect(contextValue).toHaveProperty("common");
    expect(contextValue).toHaveProperty("layout");
    expect(contextValue.layout).toHaveProperty("containerSize");
    expect(contextValue.layout).toHaveProperty("itemDimensions");
    expect(contextValue.layout).toHaveProperty("updateItemDimensions");
    expect(contextValue.layout).toHaveProperty("updateContainerSize");
  });

  it("should initialize containerSize with default values", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(contextValue.layout.containerSize.value).toEqual({ width: 0, height: 0 });
  });

  it("should initialize itemDimensions with empty object", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(contextValue.layout.itemDimensions.value).toEqual({});
  });

  it("should provide updateItemDimensions function", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(typeof contextValue.layout.updateItemDimensions).toBe("function");

    // Test the function
    contextValue.layout.updateItemDimensions(0, { width: 100, height: 50 });
    expect(contextValue.layout.itemDimensions.value).toEqual({
      0: { width: 100, height: 50 },
    });
  });

  it("should provide updateContainerSize function", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(typeof contextValue.layout.updateContainerSize).toBe("function");

    // Test the function
    contextValue.layout.updateContainerSize({ width: 400, height: 300 });
    expect(contextValue.layout.containerSize.value).toEqual({ width: 400, height: 300 });
  });

  it("should merge props and common with layout", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(contextValue.props).toEqual(mockProps);
    expect(contextValue.common).toEqual(mockCommon);
  });

  it("should handle multiple children", () => {
    const { getByText } = render(
      <GlobalStateProvider value={mockValue}>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </GlobalStateProvider>
    );

    expect(getByText("First Child")).toBeTruthy();
    expect(getByText("Second Child")).toBeTruthy();
  });

  it("should handle updateItemDimensions with multiple items", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    // Add multiple items
    contextValue.layout.updateItemDimensions(0, { width: 100, height: 50 });
    contextValue.layout.updateItemDimensions(1, { width: 120, height: 60 });
    contextValue.layout.updateItemDimensions(2, { width: 90, height: 45 });

    expect(contextValue.layout.itemDimensions.value).toEqual({
      0: { width: 100, height: 50 },
      1: { width: 120, height: 60 },
      2: { width: 90, height: 45 },
    });
  });
});

describe("useGlobalState", () => {
  const mockValue = {
    props: { width: 300, data: [1, 2, 3], renderItem: () => <Text>Item</Text> } as any,
    common: { size: 300, validLength: 3 },
  };

  it("should return context value when used within provider", () => {
    let hookResult: any;

    const TestComponent = () => {
      hookResult = useGlobalState();
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(hookResult).toHaveProperty("props");
    expect(hookResult).toHaveProperty("common");
    expect(hookResult).toHaveProperty("layout");
  });

  it("should provide expected hook functionality", () => {
    // Test that hook returns context when used correctly
    let hookResult: any;

    const TestComponent = () => {
      const context = useGlobalState();
      hookResult = context;
      return <Text>Test</Text>;
    };

    const mockValue = {
      props: { width: 300, data: [1, 2, 3], renderItem: () => <Text>Item</Text> } as any,
      common: { size: 300, validLength: 3 },
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(hookResult).toHaveProperty("props");
    expect(hookResult).toHaveProperty("common");
    expect(hookResult).toHaveProperty("layout");
  });

  it("should return the same context value as directly accessing context", () => {
    let hookResult: any;
    let contextResult: any;

    const TestComponent = () => {
      hookResult = useGlobalState();
      contextResult = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(hookResult).toBe(contextResult);
  });

  it("should provide all expected properties", () => {
    let hookResult: any;

    const TestComponent = () => {
      hookResult = useGlobalState();
      return <Text>Test</Text>;
    };

    render(
      <GlobalStateProvider value={mockValue}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(hookResult.props).toEqual(mockValue.props);
    expect(hookResult.common).toEqual(mockValue.common);
    expect(hookResult.layout).toHaveProperty("containerSize");
    expect(hookResult.layout).toHaveProperty("itemDimensions");
    expect(hookResult.layout).toHaveProperty("updateItemDimensions");
    expect(hookResult.layout).toHaveProperty("updateContainerSize");
  });
});

describe("GlobalStateContext", () => {
  it("should have default empty context value", () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = React.useContext(GlobalStateContext);
      return <Text>Test</Text>;
    };

    render(<TestComponent />);

    expect(contextValue).toEqual({});
  });
});
