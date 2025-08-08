import React from "react";
import { View } from "react-native";

import { renderHook } from "@testing-library/react-hooks";

import { useLayoutConfig } from "./useLayoutConfig";

describe("useLayoutConfig", () => {
  const defaultProps = {
    size: 300,
    vertical: false,
  };
  it("should return normal layout by default", () => {
    const { result } = renderHook(() =>
      useLayoutConfig({
        ...defaultProps,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("function");
  });

  it("should handle parallax mode", () => {
    const props = {
      ...defaultProps,
      mode: "parallax" as const,
      modeConfig: {
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 50,
        parallaxAdjacentItemScale: 0.8,
      },
    };

    const { result } = renderHook(() =>
      useLayoutConfig({
        ...props,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );
    const style = result.current(0); // Test with offset 0

    expect(style.transform).toBeDefined();
    expect(style.transform).toContainEqual({ translateX: 0 });
    expect(style.transform).toContainEqual({ scale: 0.9 });
  });

  it("should handle horizontal-stack mode", () => {
    const props = {
      ...defaultProps,
      mode: "horizontal-stack" as const,
      modeConfig: {
        snapDirection: "left" as const,
        showLength: 3,
      },
    };

    const { result } = renderHook(() =>
      useLayoutConfig({
        ...props,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );
    const style = result.current(0); // Test with offset 0

    expect(style.transform).toBeDefined();
    expect(style.zIndex).toBeDefined();
    expect(style.opacity).toBeDefined();
  });

  it("should handle vertical-stack mode", () => {
    const props = {
      ...defaultProps,
      mode: "vertical-stack" as const,
      modeConfig: {
        snapDirection: "left" as const,
        showLength: 3,
      },
    };

    const { result } = renderHook(() =>
      useLayoutConfig({
        ...props,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );
    const style = result.current(0); // Test with offset 0

    expect(style.transform).toBeDefined();
    expect(style.zIndex).toBeDefined();
    expect(style.opacity).toBeDefined();
  });

  it("should handle vertical orientation", () => {
    const props = {
      ...defaultProps,
      vertical: true,
    };

    const { result } = renderHook(() =>
      useLayoutConfig({
        ...props,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );
    const style = result.current(0); // Test with offset 0

    expect(style.transform).toBeDefined();
    expect(style.transform).toContainEqual({ translateY: 0 });
  });

  it("should handle different offsets", () => {
    const { result } = renderHook(() =>
      useLayoutConfig({
        ...defaultProps,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );

    const style1 = result.current(-1); // Previous item
    const style2 = result.current(0); // Current item
    const style3 = result.current(1); // Next item

    expect(style1.transform).toContainEqual({ translateX: -300 });
    expect(style2.transform).toContainEqual({ translateX: 0 });
    expect(style3.transform).toContainEqual({ translateX: 300 });
  });

  it("should memoize layout function", () => {
    const { result, rerender } = renderHook(() =>
      useLayoutConfig({
        ...defaultProps,
        data: [],
        renderItem: () => <View />,
        loop: false,
        autoFillData: false,
        defaultIndex: 0,
        autoPlayInterval: 0,
        scrollAnimationDuration: 0,
        width: 0,
        height: 0,
        rawData: [],
        dataLength: 0,
        rawDataLength: 0,
      })
    );
    const firstResult = result.current;

    rerender();
    expect(result.current).toBe(firstResult);
  });

  it("should update layout when props change", () => {
    const { result, rerender } = renderHook(
      (props) =>
        useLayoutConfig({
          ...props,
          data: [],
          renderItem: () => <View />,
          loop: false,
          autoFillData: false,
          defaultIndex: 0,
          autoPlayInterval: 0,
          scrollAnimationDuration: 0,
          width: 0,
          height: 0,
          rawData: [],
          dataLength: 0,
          rawDataLength: 0,
        }),
      {
        initialProps: defaultProps,
      }
    );
    const firstResult = result.current;

    rerender({ ...defaultProps, size: 400 });
    expect(result.current).not.toBe(firstResult);
  });
});
