import { renderHook } from "@testing-library/react-hooks";
import { I18nManager } from "react-native";

import type { CarouselProps } from "../types";
import { useInitProps } from "./useInitProps";

const originalIsRTL = I18nManager.isRTL;

function setRTL(isRTL: boolean) {
  Object.defineProperty(I18nManager, "isRTL", {
    configurable: true,
    value: isRTL,
  });
}

function createProps(overrides: Partial<CarouselProps<number>> = {}): CarouselProps<number> {
  return {
    data: [0, 1, 2, 3],
    renderItem: () => null,
    ...overrides,
  };
}

describe("useInitProps", () => {
  afterEach(() => {
    setRTL(originalIsRTL);
    jest.restoreAllMocks();
  });

  it("applies the v5 defaults", () => {
    const { result } = renderHook(() => useInitProps(createProps()));

    expect(result.current).toMatchObject({
      defaultIndex: 0,
      loop: false,
      autoplay: false,
      autoplayInterval: 3000,
      autoplayDirection: "forward",
      orientation: "horizontal",
      scrollEnabled: true,
      snapMode: "page",
      overscrollEnabled: true,
      dataLength: 4,
      rawDataLength: 4,
      autoFillData: true,
    });
    expect(result.current.animation).toMatchObject({ type: "timing", duration: 500 });
  });

  it("preserves explicit v5 values", () => {
    const props = createProps({
      defaultIndex: 2,
      loop: true,
      autoplay: true,
      autoplayInterval: 1200,
      autoplayDirection: "backward",
      orientation: "vertical",
      scrollEnabled: false,
      snapMode: "nearest",
      overscrollEnabled: false,
      animation: { type: "spring", damping: 18 },
      style: { height: 320 },
    });
    const { result } = renderHook(() => useInitProps(props));

    expect(result.current).toMatchObject({
      defaultIndex: 2,
      loop: true,
      autoplay: true,
      autoplayInterval: 1200,
      autoplayDirection: "backward",
      orientation: "vertical",
      scrollEnabled: false,
      snapMode: "nearest",
      overscrollEnabled: false,
      animation: { type: "spring", damping: 18 },
    });
  });

  it("derives RTL direction only for horizontal carousels", () => {
    setRTL(true);

    const horizontal = renderHook(() => useInitProps(createProps())).result.current;
    const vertical = renderHook(() => useInitProps(createProps({ orientation: "vertical" }))).result
      .current;

    expect(horizontal.directionSign).toBe(-1);
    expect(vertical.directionSign).toBe(1);
  });

  it.each([
    ["itemSize", { itemSize: 0 }],
    ["autoplayInterval", { autoplayInterval: -1 }],
    ["renderWindowSize", { renderWindowSize: 1.5 }],
  ] as const)("rejects invalid %s", (_name, invalid) => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useInitProps(createProps(invalid)));
    expect(result.error).toBeInstanceOf(Error);
  });

  it("rejects layout and itemAnimation together", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useInitProps(
        createProps({
          layout: { type: "parallax" },
          itemAnimation: () => ({}),
        } as never)
      )
    );

    expect(result.error?.message).toContain("mutually exclusive");
  });

  it("throws synchronously for an invalid initial defaultIndex", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useInitProps(createProps({ defaultIndex: 4 })));

    expect(result.error?.message).toContain("between 0 and 3");
  });

  it("defers a valid defaultIndex until data first becomes non-empty", () => {
    const hook = renderHook(({ props }) => useInitProps(props), {
      initialProps: { props: createProps({ data: [], defaultIndex: 2 }) },
    });

    expect(hook.result.current.defaultIndex).toBe(0);
    hook.rerender({ props: createProps({ data: [0, 1, 2], defaultIndex: 2 }) });
    expect(hook.result.current.defaultIndex).toBe(2);
  });

  it("warns and falls back when a deferred defaultIndex is invalid", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const hook = renderHook(({ props }) => useInitProps(props), {
      initialProps: { props: createProps({ data: [], defaultIndex: 3 }) },
    });

    hook.rerender({ props: createProps({ data: [0, 1], defaultIndex: 3 }) });
    hook.rerender({ props: createProps({ data: [0, 1], defaultIndex: 3 }) });

    expect(hook.result.current.defaultIndex).toBe(0);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it.each([
    { data: [1], expected: [1, 1, 1] },
    { data: [1, 2], expected: [1, 2, 1, 2] },
    { data: [1, 2, 3], expected: [1, 2, 3] },
  ])("auto-fills short loop data", ({ data, expected }) => {
    const { result } = renderHook(() => useInitProps(createProps({ data, loop: true })));

    expect(result.current.data).toEqual(expected);
    expect(result.current.rawData).toEqual(data);
  });
});
