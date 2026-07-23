import { renderHook } from "@testing-library/react-hooks";

import type { InitializedCarouselProps } from "./useInitProps";
import { useLayoutConfig } from "./useLayoutConfig";

function createProps(
  overrides: Partial<InitializedCarouselProps<number>> = {}
): InitializedCarouselProps<number> & { size: number } {
  return {
    data: [0, 1, 2],
    rawData: [0, 1, 2],
    dataLength: 3,
    rawDataLength: 3,
    renderItem: () => null,
    defaultIndex: 0,
    loop: false,
    autoFillData: true,
    autoplay: false,
    autoplayInterval: 3000,
    autoplayDirection: "forward",
    orientation: "horizontal",
    directionSign: 1,
    scrollEnabled: true,
    snapMode: "page",
    overscrollEnabled: true,
    animation: { type: "timing", duration: 500 },
    style: { width: 300 },
    size: 300,
    ...overrides,
  };
}

describe("useLayoutConfig", () => {
  it("returns the normal layout by default", () => {
    const { result } = renderHook(() => useLayoutConfig(createProps()));

    expect(result.current(-1).transform).toContainEqual({ translateX: -300 });
    expect(result.current(0).transform).toContainEqual({ translateX: 0 });
  });

  it("uses the vertical axis for normal vertical layouts", () => {
    const { result } = renderHook(() => useLayoutConfig(createProps({ orientation: "vertical" })));

    expect(result.current(1).transform).toContainEqual({ translateY: 300 });
  });

  it("mirrors only horizontal built-in transforms in RTL", () => {
    const normal = renderHook(() => useLayoutConfig(createProps({ directionSign: -1 }))).result
      .current;
    const parallax = renderHook(() =>
      useLayoutConfig(
        createProps({
          directionSign: -1,
          layout: { type: "parallax", offset: 50 },
        })
      )
    ).result.current;

    expect(normal(1).transform).toContainEqual({ translateX: -300 });
    expect(parallax(1).transform).toContainEqual({ translateX: -250 });
  });

  it("accepts a flat parallax layout", () => {
    const { result } = renderHook(() =>
      useLayoutConfig(
        createProps({
          layout: { type: "parallax", offset: 50, scale: 0.9, adjacentScale: 0.8 },
        })
      )
    );
    const style = result.current(0);

    expect(style.transform).toContainEqual({ translateX: 0 });
    expect(style.transform).toContainEqual({ scale: 0.9 });
  });

  it.each(["horizontal-stack", "vertical-stack"] as const)(
    "accepts flat %s fields and supplies visibleCount",
    (type) => {
      const { result } = renderHook(() =>
        useLayoutConfig(
          createProps({
            layout: { type, visibleCount: 3, exitDirection: "left" },
          })
        )
      );

      expect(result.current(0)).toMatchObject({
        transform: expect.any(Array),
        zIndex: expect.any(Number),
        opacity: expect.any(Number),
      });
    }
  );

  it("memoizes until layout inputs change", () => {
    const hook = renderHook(({ props }) => useLayoutConfig(props), {
      initialProps: { props: createProps() },
    });
    const initial = hook.result.current;

    hook.rerender({ props: createProps() });
    expect(hook.result.current).toBe(initial);

    hook.rerender({ props: createProps({ size: 400 }) });
    expect(hook.result.current).not.toBe(initial);
  });
});
