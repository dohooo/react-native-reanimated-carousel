import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { act } from "react-test-renderer";

import { Pagination } from ".";

jest.mock("react-native-worklets", () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));

describe("Pagination.Basic", () => {
  it("throws when size/dot width/height are non-number", () => {
    const Test = () => {
      const progress = useSharedValue(0);
      return (
        <Pagination.Basic
          data={[1, 2]}
          progress={progress}
          // @ts-expect-error intentional invalid type
          size={"12px"}
        />
      );
    };

    expect(() => render(<Test />)).toThrow("size/width/height must be a number");
  });

  it("renders dots and calls onPress", async () => {
    const handlePress = jest.fn();
    const Test = () => {
      const progress = useSharedValue(0);
      return (
        <Pagination.Basic
          data={[1, 2, 3]}
          progress={progress}
          onPress={handlePress}
          carouselName="Demo"
        />
      );
    };

    const { UNSAFE_root } = render(<Test />);
    await act(async () => {});

    const buttons = UNSAFE_root.findAll(
      (node) =>
        node?.props?.accessibilityRole === "button" &&
        typeof node?.props?.accessibilityLabel === "string" &&
        node.props.accessibilityLabel.startsWith("Slide ")
    );

    const uniqueByLabel = Array.from(
      new Map(buttons.map((b) => [b.props.accessibilityLabel, b])).values()
    );

    expect(uniqueByLabel).toHaveLength(3);

    await act(async () => {
      fireEvent.press(uniqueByLabel[1]);
    });
    expect(handlePress).toHaveBeenCalledWith(1);
  });

  it("does not include undefined in default accessibilityLabel when carouselName is omitted", async () => {
    const Test = () => {
      const progress = useSharedValue(0);
      return <Pagination.Basic data={[1, 2]} progress={progress} />;
    };

    const { UNSAFE_root } = render(<Test />);
    await act(async () => {});

    const buttons = UNSAFE_root.findAll(
      (node) =>
        node?.props?.accessibilityRole === "button" &&
        typeof node?.props?.accessibilityLabel === "string" &&
        node.props.accessibilityLabel.startsWith("Slide ")
    );

    const uniqueByLabel = Array.from(
      new Map(buttons.map((b) => [b.props.accessibilityLabel, b])).values()
    );

    expect(uniqueByLabel[0].props.accessibilityLabel).toBe("Slide 1 of 2");
    expect(uniqueByLabel[0].props.accessibilityLabel).not.toContain("undefined");
  });
});

describe("Pagination.Custom", () => {
  it("throws when any size-related prop is non-number", () => {
    const Test = () => {
      const progress = useSharedValue(0);
      return (
        <Pagination.Custom
          data={[1]}
          progress={progress}
          // @ts-expect-error intentional invalid type
          activeDotStyle={{ width: "10px" }}
        />
      );
    };

    expect(() => render(<Test />)).toThrow("size/width/height must be a number");
  });

  it("uses max item dimensions for container min sizes", async () => {
    const Test = () => {
      const progress = useSharedValue(0);
      return (
        <Pagination.Custom
          data={[1, 2]}
          progress={progress}
          size={12}
          dotStyle={{ width: 14, height: 8 }}
          activeDotStyle={{ width: 16, height: 20 }}
        />
      );
    };

    const { UNSAFE_root } = render(<Test />);
    await act(async () => {});

    // @ts-expect-error
    const container = UNSAFE_root.findByType(View);
    const flattened = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;

    expect(flattened.minWidth).toBe(16);
    expect(flattened.minHeight).toBe(20);
  });

  it("allows overriding pagination item accessibility props", async () => {
    const Test = () => {
      const progress = useSharedValue(0);
      return (
        <Pagination.Custom
          data={[1, 2]}
          progress={progress}
          paginationItemAccessibility={(index: number, length: number) => ({
            accessibilityLabel: `Page ${index + 1}/${length}`,
            accessibilityHint: `Jump to ${index + 1}`,
            accessibilityRole: "link",
          })}
        />
      );
    };

    const { UNSAFE_root } = render(<Test />);
    await act(async () => {});

    const item = UNSAFE_root.find(
      (node) =>
        node?.props?.accessibilityLabel === "Page 1/2" && node?.props?.accessibilityRole === "link"
    );

    expect(item.props.accessibilityHint).toBe("Jump to 1");
  });
});
