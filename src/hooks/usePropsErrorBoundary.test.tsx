import { renderHook } from "@testing-library/react-hooks";

import type { InitializedCarouselProps } from "./useInitProps";
import { usePropsErrorBoundary } from "./usePropsErrorBoundary";

function createProps(
  overrides: Partial<InitializedCarouselProps<number>> = {}
): InitializedCarouselProps<number> {
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
    style: {},
    contentContainerStyle: {},
    animation: { type: "timing", duration: 500 },
    ...overrides,
  };
}

describe("usePropsErrorBoundary", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("accepts explicit and flexible main-axis sizing", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    renderHook(() => usePropsErrorBoundary(createProps({ style: { width: "100%", height: 190 } })));
    renderHook(() =>
      usePropsErrorBoundary(createProps({ orientation: "vertical", style: { flex: 1 } }))
    );

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("warns once when the main-axis size must be measured implicitly", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = renderHook(() =>
      usePropsErrorBoundary(createProps({ style: { height: 190 } }))
    );

    rerender();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("horizontal Carousel"));
  });

  it("warns once when protected content style fields are supplied", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = renderHook(() =>
      usePropsErrorBoundary(
        createProps({
          style: { width: 300 },
          contentContainerStyle: { opacity: 0.5 } as never,
        })
      )
    );

    rerender();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("cannot set"));
  });
});
