import type { FC } from "react";
import React from "react";
import Animated, { useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import renderer from "react-test-renderer";

describe("useSharedValue", () => {
  it("retains value on rerender", () => {
    const initialValue = 0;
    const updatedValue = 1;

    interface Props {
      key: string;
      value: number;
    }

    const TestComponent: FC<Props> = (props) => {
      const opacity = useDerivedValue(() => props.value, [props.value]);
      const animatedStyle = useAnimatedStyle(
        () => ({
          opacity: opacity.value,
        }),
        [opacity]
      );

      return <Animated.View style={animatedStyle} />;
    };

    // When rendering with initial value
    const wrapper = renderer.create(<TestComponent key="box" value={initialValue} />);

    expect(
      typeof wrapper.root.children[0] !== "string"
        ? wrapper.root.children[0].props.style.jestAnimatedStyle.current.value.opacity
        : false
    ).toBe(initialValue);

    // When rendering with updated value
    wrapper.update(<TestComponent key="box" value={updatedValue} />);

    expect(
      typeof wrapper.root.children[0] !== "string"
        ? wrapper.root.children[0].props.style.jestAnimatedStyle.current.value.opacity
        : false
    ).toBe(initialValue);
  });
});
