import { renderHook } from "@testing-library/react-hooks";

import { usePropsErrorBoundary } from "./usePropsErrorBoundary";

import type { TCarouselProps } from "../types";

function createProps(overrides: Partial<TCarouselProps<number>> = {}): TCarouselProps<number> & {
  dataLength: number;
} {
  return {
    data: [0, 1, 2],
    dataLength: 3,
    renderItem: () => null,
    ...overrides,
  } as TCarouselProps<number> & { dataLength: number };
}

describe("usePropsErrorBoundary", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("accepts percentage and flex container sizing without contradictory warnings", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    renderHook(() =>
      usePropsErrorBoundary(
        createProps({
          style: { width: "100%", height: 190 },
          itemWidth: 280,
        })
      )
    );
    renderHook(() =>
      usePropsErrorBoundary(
        createProps({
          vertical: true,
          style: { flex: 1 },
          itemHeight: 190,
        })
      )
    );

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("Horizontal mode"));
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("`itemWidth` sets"));
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("Vertical mode"));
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("`itemHeight` sets"));

    warnSpy.mockClear();
    renderHook(() => usePropsErrorBoundary(createProps({ style: { flex: 0, height: 190 } })));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Horizontal mode"));

    warnSpy.mockClear();
    renderHook(() => usePropsErrorBoundary(createProps({ vertical: true })));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Vertical mode"));
  });
});
