import React from "react";
import { Text } from "react-native";

import { act, renderHook } from "@testing-library/react-hooks";

import { useInitProps } from "./useInitProps";

import type { TCarouselProps } from "../types";

describe("useInitProps", () => {
  const defaultData = [1, 2, 3, 4];
  const defaultProps: TCarouselProps<number> = {
    data: defaultData,
    width: 300,
    height: 200,
    renderItem: ({ item: _item }) => <Text>Item</Text>,
  };

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useInitProps(defaultProps));

    expect(result.current).toEqual(
      expect.objectContaining({
        defaultIndex: 0,
        loop: true,
        autoPlayInterval: 1000,
        scrollAnimationDuration: 500,
        width: 300,
        height: 200,
        enabled: true,
        autoFillData: true,
        pagingEnabled: true,
        snapEnabled: true,
        overscrollEnabled: true,
        data: defaultData,
        rawData: defaultData,
        dataLength: 4,
        rawDataLength: 4,
      })
    );
  });

  it("should handle custom values", () => {
    const customProps: TCarouselProps<number> = {
      ...defaultProps,
      defaultIndex: 2,
      loop: false,
      autoPlayInterval: 2000,
      scrollAnimationDuration: 300,
      enabled: false,
      autoFillData: false,
      pagingEnabled: false,
      snapEnabled: false,
      overscrollEnabled: false,
    };

    const { result } = renderHook(() => useInitProps(customProps));

    expect(result.current).toEqual(
      expect.objectContaining({
        ...customProps,
        data: defaultData,
        rawData: defaultData,
        dataLength: 4,
        rawDataLength: 4,
      })
    );
  });
  it("should handle stack mode configuration", () => {
    const stackProps: TCarouselProps<number> = {
      ...defaultProps,
      mode: "horizontal-stack",
      modeConfig: {
        showLength: 3,
      },
    };

    const { result } = renderHook(() => useInitProps(stackProps));

    expect(result.current.modeConfig).toBeDefined();
    if (result.current.modeConfig && "showLength" in result.current.modeConfig)
      expect(result.current.modeConfig.showLength).toBe(3); // dataLength - 1
  });

  it("should handle empty data array", () => {
    const props: TCarouselProps<number> = {
      ...defaultProps,
      data: [],
    };

    const { result } = renderHook(() => useInitProps(props));

    expect(result.current.dataLength).toBe(0);
    expect(result.current.rawDataLength).toBe(0);
  });

  it.each([-1, 4, 1.5])(
    "throws synchronously for invalid defaultIndex %s with non-empty data",
    (defaultIndex) => {
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      const hook = renderHook(() =>
        useInitProps({
          ...defaultProps,
          defaultIndex,
        })
      );

      expect(hook.result.error).toEqual(
        new Error(
          "[react-native-reanimated-carousel] defaultIndex must be an integer between 0 and 3."
        )
      );
      error.mockRestore();
    }
  );

  it("defers a valid defaultIndex until data first becomes non-empty", () => {
    const hook = renderHook(
      ({ data }) =>
        useInitProps({
          ...defaultProps,
          data,
          defaultIndex: 2,
        }),
      { initialProps: { data: [] as number[] } }
    );

    expect(hook.result.current.defaultIndex).toBe(0);

    act(() => {
      hook.rerender({ data: [1, 2, 3] });
    });

    expect(hook.result.current.defaultIndex).toBe(2);
  });

  it("warns and falls back to zero when a deferred defaultIndex is invalid", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const hook = renderHook(
      ({ data }) =>
        useInitProps({
          ...defaultProps,
          data,
          defaultIndex: 5,
        }),
      { initialProps: { data: [] as number[] } }
    );

    act(() => {
      hook.rerender({ data: [1, 2, 3] });
    });

    expect(hook.result.current.defaultIndex).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });

  it("should round width and height values", () => {
    const props: TCarouselProps<number> = {
      ...defaultProps,
      width: 300.6,
      height: 200.4,
    };

    const { result } = renderHook(() => useInitProps(props));

    expect(result.current.width).toBe(301);
    expect(result.current.height).toBe(200);
  });

  it("should handle enableSnap property", () => {
    const props: TCarouselProps<number> = {
      ...defaultProps,
      enableSnap: false,
    };

    const { result } = renderHook(() => useInitProps(props));

    expect(result.current.snapEnabled).toBe(false);
  });
  it("should handle vertical-stack mode", () => {
    const props: TCarouselProps<number> = {
      ...defaultProps,
      mode: "vertical-stack",
      modeConfig: {
        showLength: 3,
      },
    };

    const { result } = renderHook(() => useInitProps(props));
    expect(result.current.modeConfig).toBeDefined();
    if (result.current.modeConfig && "showLength" in result.current.modeConfig)
      expect(result.current.modeConfig.showLength).toBe(3); // dataLength - 1
  });
});
