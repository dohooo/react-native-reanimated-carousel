import { fireEvent, render } from "@testing-library/react-native";
import { I18nManager, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { Pagination } from ".";
import { getPaginationDotDistance, getPaginationSelectedIndex } from "./PaginationItem";

const originalIsRTL = I18nManager.isRTL;

function setRTL(isRTL: boolean) {
  Object.defineProperty(I18nManager, "isRTL", {
    configurable: true,
    value: isRTL,
  });
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  setRTL(originalIsRTL);
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function InteractivePagination(props: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  const progress = useSharedValue(0);
  return <Pagination count={3} progress={progress} onPress={() => {}} {...props} />;
}

function getButtons(screen: ReturnType<typeof render>) {
  const matching = screen.UNSAFE_root.findAll(
    (node) =>
      node.props.accessibilityRole === "button" && typeof node.props.accessibilityLabel === "string"
  );
  return Array.from(
    new Map(matching.map((node) => [node.props.accessibilityLabel as string, node])).values()
  );
}

describe("Pagination", () => {
  it("renders nothing for count zero and rejects invalid count", () => {
    const Empty = () => {
      const progress = useSharedValue(0);
      return <Pagination count={0} progress={progress} />;
    };
    const Invalid = () => {
      const progress = useSharedValue(0);
      return <Pagination count={1.5} progress={progress} />;
    };

    expect(render(<Empty />).toJSON()).toBeNull();
    expect(() => render(<Invalid />)).toThrow("Pagination count must be a non-negative integer");
  });

  it("rejects runtime-invalid narrow dot styles", () => {
    const Invalid = () => {
      const progress = useSharedValue(0);
      return <Pagination count={2} progress={progress} dotStyle={{ width: "12px" } as never} />;
    };

    expect(() => render(<Invalid />)).toThrow("Pagination dotStyle.width must be a finite number");
  });

  it("renders interactive dots as selected buttons and reports raw indexes", () => {
    const onPress = jest.fn();
    const screen = render(
      <InteractivePagination
        getItemAccessibilityLabel={(index, count) => `Page ${index + 1}/${count}`}
        onPress={onPress}
      />
    );

    const buttons = getButtons(screen);
    expect(buttons).toHaveLength(3);
    expect(buttons[0].props.accessibilityLabel).toBe("Page 1/3");
    expect(buttons[0].props.accessibilityRole).toBe("button");
    expect(buttons[0].props.accessibilityState).toEqual({ selected: true });
    expect(buttons[1].props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(buttons[2]);
    expect(onPress).toHaveBeenCalledWith(2);
  });

  it("uses default accessibility labels for interactive dots", () => {
    const screen = render(<InteractivePagination />);
    const buttons = getButtons(screen);

    expect(buttons.map((button) => button.props.accessibilityLabel)).toEqual([
      "Slide 1 of 3",
      "Slide 2 of 3",
      "Slide 3 of 3",
    ]);
  });

  it("hides decorative dots from the accessibility tree", () => {
    const Decorative = () => {
      const progress = useSharedValue(0);
      return <Pagination count={3} progress={progress} />;
    };
    const screen = render(<Decorative />);

    expect(getButtons(screen)).toHaveLength(0);
    const hiddenDots = screen.UNSAFE_root.findAllByType(View).filter(
      (node) => node.props.importantForAccessibility === "no-hide-descendants"
    );
    expect(hiddenDots).toHaveLength(3);
    expect(hiddenDots.every((node) => node.props.accessible === false)).toBe(true);
  });

  it("keeps one dot selected when count is one", () => {
    const Single = () => {
      const progress = useSharedValue(10_000_000.4);
      return <Pagination count={1} progress={progress} onPress={() => {}} />;
    };
    const screen = render(<Single />);

    expect(getButtons(screen)[0].props.accessibilityState).toEqual({ selected: true });
  });

  it("reserves the larger base and active dimensions without swapping axes", () => {
    const screen = render(
      <InteractivePagination
        orientation="vertical"
        dotStyle={{ width: 8, height: 14 }}
        activeDotStyle={{ width: 20, height: 10 }}
      />
    );
    const buttonStyle = StyleSheet.flatten(getButtons(screen)[0].props.style);
    const verticalContainer = screen.UNSAFE_root.findAllByType(View).find(
      (node) => StyleSheet.flatten(node.props.style)?.flexDirection === "column"
    );

    expect(buttonStyle).toMatchObject({ width: 20, height: 14 });
    expect(verticalContainer).toBeTruthy();
  });

  it("follows the application direction for horizontal dots only", () => {
    setRTL(true);
    const horizontal = render(<InteractivePagination />);
    const vertical = render(<InteractivePagination orientation="vertical" />);
    const horizontalContainer = horizontal.UNSAFE_root.findAllByType(View).find(
      (node) => StyleSheet.flatten(node.props.style)?.flexDirection === "row"
    );
    const verticalContainer = vertical.UNSAFE_root.findAllByType(View).find(
      (node) => StyleSheet.flatten(node.props.style)?.flexDirection === "column"
    );

    expect(StyleSheet.flatten(horizontalContainer?.props.style)).toMatchObject({
      direction: "rtl",
      flexDirection: "row",
    });
    expect(StyleSheet.flatten(verticalContainer?.props.style)?.direction).toBeUndefined();
  });

  it("ignores protected container direction fields and warns once", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const screen = render(
      <InteractivePagination
        containerStyle={{ direction: "rtl", flexDirection: "column", gap: 6 } as never}
      />
    );
    screen.rerender(
      <InteractivePagination
        containerStyle={{ direction: "rtl", flexDirection: "column", gap: 8 } as never}
      />
    );
    const container = screen.UNSAFE_root.findAllByType(View).find(
      (node) => StyleSheet.flatten(node.props.style)?.flexDirection === "row"
    );

    expect(StyleSheet.flatten(container?.props.style)).toMatchObject({
      direction: "ltr",
      flexDirection: "row",
      gap: 8,
    });
    const protectedStyleWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes("Pagination containerStyle cannot override")
    );
    expect(protectedStyleWarnings).toHaveLength(1);
  });
});

describe("Pagination nearest-cycle math", () => {
  it("activates the nearest equivalent dot across both loop seams", () => {
    expect(getPaginationDotDistance(4.8, 0, 5)).toBeCloseTo(0.2);
    expect(getPaginationDotDistance(-0.2, 0, 5)).toBeCloseTo(0.2);
    expect(getPaginationDotDistance(5.2, 0, 5)).toBeCloseTo(0.2);
    expect(getPaginationDotDistance(4.8, 4, 5)).toBeCloseTo(0.8);
  });

  it("remains finite and selects the raw index after many loop cycles", () => {
    const progress = 10_000_000.375;
    const count = 7;
    const distances = Array.from({ length: count }, (_, index) =>
      getPaginationDotDistance(progress, index, count)
    );

    expect(distances.every(Number.isFinite)).toBe(true);
    expect(Math.min(...distances)).toBeCloseTo(0.375);
    expect(getPaginationSelectedIndex(progress, count)).toBe(3);
  });
});
