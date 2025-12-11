import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { Pagination } from ".";

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

  it("renders dots and calls onPress", () => {
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

    fireEvent.press(uniqueByLabel[1]);
    expect(handlePress).toHaveBeenCalledWith(1);
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

  it("uses max item dimensions for container min sizes", () => {
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

    // @ts-expect-error
    const container = UNSAFE_root.findByType(View);
    const flattened = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;

    expect(flattened.minWidth).toBe(16);
    expect(flattened.minHeight).toBe(20);
  });
});
