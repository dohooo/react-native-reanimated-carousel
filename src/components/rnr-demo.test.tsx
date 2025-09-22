import { render } from "@testing-library/react-native";
import type { FC } from "react";
import React from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

describe("Carousel Animations", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("animates opacity with timing", () => {
    const TestComponent: FC<{ value: number }> = ({ value }) => {
      const sharedValue = useSharedValue(value);

      // Using withTiming to wrap the value change, so it can be tested
      const animatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(sharedValue.value, { duration: 500 }),
      }));

      // When the prop changes, update the shared value
      React.useEffect(() => {
        sharedValue.value = value;
      }, [value, sharedValue]);

      return <Animated.View testID="animated-view" style={animatedStyle} />;
    };

    const initialValue = 0;
    const updatedValue = 1;

    const { getByTestId, rerender } = render(<TestComponent value={initialValue} />);
    const view = getByTestId("animated-view");

    // Verify the initial state
    expect(view).toHaveAnimatedStyle({ opacity: initialValue });

    // Trigger the value change
    rerender(<TestComponent value={updatedValue} />);

    // Advance the animation to the middle point
    jest.advanceTimersByTime(250);
    expect(view).toHaveAnimatedStyle({ opacity: 0.5 }); // Animation middle value

    // Advance the animation to the completion
    jest.advanceTimersByTime(250);
    expect(view).toHaveAnimatedStyle({ opacity: updatedValue }); // Animation completion
  });
});
