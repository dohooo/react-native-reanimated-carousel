import { act, renderHook } from "@testing-library/react-hooks";
import { StyleProp, ViewStyle } from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";

import { useCommonVariables } from "./useCommonVariables";
import type { TInitializeCarouselProps } from "./useInitProps";

function createBaseProps(
  overrides: Partial<TInitializeCarouselProps<any>> = {}
): TInitializeCarouselProps<any> {
  return {
    defaultIndex: 0,
    loop: true,
    scrollAnimationDuration: 500,
    autoFillData: true,
    autoPlayInterval: 2000,
    autoPlay: false,
    data: [0, 1, 2, 3],
    dataLength: 4,
    rawData: [0, 1, 2, 3],
    rawDataLength: 4,
    vertical: false,
    style: { width: 700, height: 350 } as StyleProp<ViewStyle>,
    renderItem: () => null,
    pagingEnabled: true,
    enabled: true,
    overscrollEnabled: true,
    snapEnabled: true,
    testID: "carousel",
    ...overrides,
  } as TInitializeCarouselProps<any>;
}

describe("useCommonVariables", () => {
  it("returns expected values when style provides width", () => {
    const props = createBaseProps();
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(700);
    expect(result.current.validLength).toBe(3);
    expect(result.current.handlerOffset.value).toBeCloseTo(0);
    expect(result.current.resolvedSize.value).toBe(700);
    expect(result.current.sizePhase.value).toBe("ready");
  });

  it("uses style.height as size when vertical", () => {
    const props = createBaseProps({ vertical: true, style: { height: 360 } });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(360);
    expect(result.current.resolvedSize.value).toBe(360);
  });

  it("initializes handlerOffset when defaultIndex is non-zero", () => {
    const props = createBaseProps({ defaultIndex: 2 });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.handlerOffset.value).toBe(-1400);
  });

  it("respects custom defaultScrollOffsetValue", () => {
    let shared!: SharedValue<number>;
    const { result } = renderHook(() => {
      shared = useSharedValue(-500);
      const props = createBaseProps({ defaultScrollOffsetValue: shared });
      return useCommonVariables(props);
    });

    expect(result.current.handlerOffset).toBe(shared);
    expect(result.current.handlerOffset.value).toBe(-500);
  });

  it("sets validLength to 0 when dataLength is 1", () => {
    const props = createBaseProps({ dataLength: 1, data: [0] });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.validLength).toBe(0);
  });

  it("sets validLength to -1 when dataLength is 0", () => {
    const props = createBaseProps({ dataLength: 0, data: [] });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.validLength).toBe(-1);
  });

  it("handles negative defaultIndex", () => {
    const props = createBaseProps({ defaultIndex: -1 });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.handlerOffset.value).toBe(-700);
  });

  it("keeps size calculation when loop is disabled", () => {
    const props = createBaseProps({ loop: false });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(700);
    expect(result.current.validLength).toBe(3);
  });

  it("syncs resolvedSize when style width changes", () => {
    const initial = createBaseProps();
    const hook = renderHook(({ p }) => useCommonVariables(p), { initialProps: { p: initial } });
    expect(hook.result.current.resolvedSize.value).toBe(700);

    const updated = createBaseProps({ style: { width: 800 } });
    act(() => {
      hook.rerender({ p: updated });
    });

    expect(hook.result.current.resolvedSize.value).toBe(800);
  });

  it("updates validLength when dataLength changes", () => {
    const hook = renderHook(({ p }) => useCommonVariables(p), {
      initialProps: { p: createBaseProps() },
    });
    expect(hook.result.current.validLength).toBe(3);

    act(() => {
      hook.rerender({ p: createBaseProps({ dataLength: 6, data: [0, 1, 2, 3, 4, 5] }) });
    });

    expect(hook.result.current.validLength).toBe(5);
  });

  it("remains pending when style lacks numeric size", () => {
    const props = createBaseProps({ style: { width: "100%" } });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(0);
    expect(result.current.resolvedSize.value).toBeNull();
    expect(result.current.sizePhase.value).toBe("pending");
  });

  it("keeps handlerOffset at zero when width is 0", () => {
    const props = createBaseProps({ style: { width: 0 } });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(0);
    expect(result.current.handlerOffset.value).toBeCloseTo(0);
  });

  it("handles large defaultIndex values", () => {
    const props = createBaseProps({ defaultIndex: 10 });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.handlerOffset.value).toBe(-7000);
  });

  it("returns zero size when vertical height is 0", () => {
    const props = createBaseProps({ vertical: true, style: { height: 0 } });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(0);
  });

  it("accepts floating point dimensions", () => {
    const props = createBaseProps({ style: { width: 700.5 } });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(700.5);
    expect(result.current.resolvedSize.value).toBe(700.5);
  });

  it("stays pending when only height is provided", () => {
    const props = createBaseProps({ style: { height: 200 } });
    const { result } = renderHook(() => useCommonVariables(props));

    expect(result.current.size).toBe(0);
    expect(result.current.sizePhase.value).toBe("pending");
  });

  describe("itemWidth/itemHeight props", () => {
    it("uses itemWidth for horizontal carousel size when provided", () => {
      const props = createBaseProps({
        style: { width: 700, height: 350 },
        itemWidth: 350,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(350);
      expect(result.current.resolvedSize.value).toBe(350);
      expect(result.current.sizePhase.value).toBe("ready");
    });

    it("uses itemHeight for vertical carousel size when provided", () => {
      const props = createBaseProps({
        vertical: true,
        style: { width: 700, height: 350 },
        itemHeight: 200,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(200);
      expect(result.current.resolvedSize.value).toBe(200);
      expect(result.current.sizePhase.value).toBe("ready");
    });

    it("prioritizes itemWidth over style.width for horizontal carousel", () => {
      const props = createBaseProps({
        style: { width: 700 },
        itemWidth: 350,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(350);
    });

    it("prioritizes itemHeight over style.height for vertical carousel", () => {
      const props = createBaseProps({
        vertical: true,
        style: { height: 400 },
        itemHeight: 200,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(200);
    });

    it("prioritizes itemWidth over deprecated width prop", () => {
      const props = createBaseProps({
        width: 700,
        itemWidth: 350,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(350);
    });

    it("prefers style.width over deprecated width prop when itemWidth not provided", () => {
      const props = createBaseProps({
        width: 500,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(700);
    });

    it("prefers style.height over deprecated height prop when itemHeight not provided in vertical mode", () => {
      const props = createBaseProps({
        vertical: true,
        height: 400,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(350);
    });

    it("falls back to deprecated width prop when style.width is not provided", () => {
      const props = createBaseProps({
        style: {},
        width: 500,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(500);
    });

    it("falls back to deprecated height prop when style.height is not provided (vertical mode)", () => {
      const props = createBaseProps({
        vertical: true,
        style: {},
        height: 400,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(400);
    });

    it("ignores zero or negative itemWidth", () => {
      const props = createBaseProps({
        style: { width: 700 },
        itemWidth: 0,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(700);
    });

    it("ignores zero or negative itemHeight", () => {
      const props = createBaseProps({
        vertical: true,
        style: { height: 400 },
        itemHeight: -10,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.size).toBe(400);
    });

    it("calculates handlerOffset correctly with itemWidth", () => {
      const props = createBaseProps({
        style: { width: 700 },
        itemWidth: 350,
        defaultIndex: 2,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      // defaultIndex 2 * itemWidth 350 = -700
      expect(result.current.handlerOffset.value).toBe(-700);
    });

    it("updates resolvedSize when itemWidth changes", () => {
      const initial = createBaseProps({ style: { width: 700 }, itemWidth: 350 });
      const hook = renderHook(({ p }) => useCommonVariables(p), { initialProps: { p: initial } });
      expect(hook.result.current.size).toBe(350);
      expect(hook.result.current.resolvedSize.value).toBe(350);

      const updated = createBaseProps({ style: { width: 700 }, itemWidth: 400 });
      act(() => {
        hook.rerender({ p: updated });
      });

      // resolvedSize (SharedValue) updates immediately via useEffect
      expect(hook.result.current.resolvedSize.value).toBe(400);
      // size (state) updates asynchronously via useAnimatedReaction
      // In test environment, this requires waiting for the animated reaction to fire
    });
  });

  describe("sizeExplicit flag", () => {
    it("sets sizeExplicit to true when itemWidth is provided for horizontal carousel", () => {
      const props = createBaseProps({
        style: { width: 700 },
        itemWidth: 350,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.sizeExplicit).toBe(true);
    });

    it("sets sizeExplicit to true when itemHeight is provided for vertical carousel", () => {
      const props = createBaseProps({
        vertical: true,
        style: { height: 400 },
        itemHeight: 200,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.sizeExplicit).toBe(true);
    });

    it("sets sizeExplicit to false when only style.width is provided", () => {
      const props = createBaseProps({
        style: { width: 700 },
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.sizeExplicit).toBe(false);
    });

    it("sets sizeExplicit to false when only deprecated width prop is provided", () => {
      const props = createBaseProps({
        width: 700,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.sizeExplicit).toBe(false);
    });

    it("sets sizeExplicit to false when itemWidth is zero", () => {
      const props = createBaseProps({
        style: { width: 700 },
        itemWidth: 0,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.sizeExplicit).toBe(false);
    });

    it("sets sizeExplicit to false when itemHeight is negative", () => {
      const props = createBaseProps({
        vertical: true,
        style: { height: 400 },
        itemHeight: -10,
      });
      const { result } = renderHook(() => useCommonVariables(props));

      expect(result.current.sizeExplicit).toBe(false);
    });
  });
});
