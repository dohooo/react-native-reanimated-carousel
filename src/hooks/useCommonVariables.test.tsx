import { act, renderHook } from "@testing-library/react-hooks";
import type { SharedValue } from "react-native-reanimated";

import { useCommonVariables } from "./useCommonVariables";
import type { InitializedCarouselProps } from "./useInitProps";

function createProps(
  overrides: Partial<InitializedCarouselProps<number>> = {}
): InitializedCarouselProps<number> {
  return {
    data: [0, 1, 2, 3],
    rawData: [0, 1, 2, 3],
    dataLength: 4,
    rawDataLength: 4,
    renderItem: () => null,
    defaultIndex: 0,
    loop: false,
    autoFillData: true,
    autoplay: false,
    autoplayInterval: 3000,
    autoplayDirection: "forward",
    orientation: "horizontal",
    scrollEnabled: true,
    snapMode: "page",
    overscrollEnabled: true,
    animation: { type: "timing", duration: 500 },
    style: { width: 700, height: 350 },
    ...overrides,
  };
}

describe("useCommonVariables", () => {
  it("resolves the main-axis size from style", () => {
    const horizontal = renderHook(() => useCommonVariables(createProps())).result.current;
    const vertical = renderHook(() => useCommonVariables(createProps({ orientation: "vertical" })))
      .result.current;

    expect(horizontal.size).toBe(700);
    expect(vertical.size).toBe(350);
    expect(horizontal.sizePhase.value).toBe("ready");
  });

  it("gives itemSize precedence and marks it explicit", () => {
    const { result } = renderHook(() => useCommonVariables(createProps({ itemSize: 280 })));

    expect(result.current.size).toBe(280);
    expect(result.current.sizeExplicit).toBe(true);
  });

  it("stays pending until an automatic size is measured", () => {
    const { result } = renderHook(() =>
      useCommonVariables(createProps({ style: { width: "100%" } }))
    );

    expect(result.current.size).toBe(0);
    expect(result.current.resolvedSize.value).toBeNull();
    expect(result.current.sizePhase.value).toBe("pending");
  });

  it("initializes internal and consumer offsets from defaultIndex", () => {
    const external = { value: 999 } as SharedValue<number>;
    const internal = renderHook(() => useCommonVariables(createProps({ defaultIndex: 2 }))).result
      .current;
    const consumer = renderHook(() =>
      useCommonVariables(createProps({ defaultIndex: 2, scrollOffsetValue: external }))
    ).result.current;

    expect(internal.handlerOffset.value).toBe(-1400);
    expect(consumer.handlerOffset).toBe(external);
    expect(external.value).toBe(-1400);
  });

  it("handles empty data without producing NaN", () => {
    const { result } = renderHook(() =>
      useCommonVariables(createProps({ data: [], rawData: [], dataLength: 0, rawDataLength: 0 }))
    );

    expect(result.current.validLength).toBe(-1);
    expect(result.current.handlerOffset.value).toBe(0);
    expect(Number.isNaN(result.current.handlerOffset.value)).toBe(false);
  });

  it("clamps a non-loop offset immediately when data shrinks while idle", () => {
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: { props: createProps() },
    });
    hook.result.current.handlerOffset.value = -2100;

    act(() => {
      hook.rerender({
        props: createProps({
          data: [0, 1],
          rawData: [0, 1],
          dataLength: 2,
          rawDataLength: 2,
        }),
      });
    });

    expect(hook.result.current.handlerOffset.value).toBe(-700);
  });

  it("defers data reconciliation until active movement settles", () => {
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: { props: createProps() },
    });
    hook.result.current.handlerOffset.value = -2100;

    act(() => {
      hook.result.current.startMovement();
      hook.rerender({
        props: createProps({
          data: [0, 1],
          rawData: [0, 1],
          dataLength: 2,
          rawDataLength: 2,
        }),
      });
    });
    expect(hook.result.current.handlerOffset.value).toBe(-2100);

    act(() => hook.result.current.settleMovement());
    expect(hook.result.current.handlerOffset.value).toBe(-700);
  });

  it.each([
    {
      name: "insertion",
      initial: [10, 20, 30],
      next: [5, 10, 20, 30],
      initialOffset: -700,
      expectedOffset: -1400,
    },
    {
      name: "deletion",
      initial: [10, 20, 30],
      next: [20, 30],
      initialOffset: -1400,
      expectedOffset: -700,
    },
    {
      name: "reorder",
      initial: [10, 20, 30],
      next: [20, 10, 30],
      initialOffset: -700,
      expectedOffset: 0,
    },
  ])("retains the keyed item across $name", ({ initial, next, initialOffset, expectedOffset }) => {
    const keyExtractor = (item: number) => String(item);
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: {
        props: createProps({
          data: initial,
          rawData: initial,
          dataLength: initial.length,
          rawDataLength: initial.length,
          keyExtractor,
        }),
      },
    });
    hook.result.current.handlerOffset.value = initialOffset;

    act(() => {
      hook.rerender({
        props: createProps({
          data: next,
          rawData: next,
          dataLength: next.length,
          rawDataLength: next.length,
          keyExtractor,
        }),
      });
    });

    expect(hook.result.current.handlerOffset.value).toBe(expectedOffset);
  });

  it("clamps the numeric index when the keyed current item disappears", () => {
    const keyExtractor = (item: number) => String(item);
    const initial = [10, 20, 30];
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: {
        props: createProps({
          data: initial,
          rawData: initial,
          dataLength: initial.length,
          rawDataLength: initial.length,
          keyExtractor,
        }),
      },
    });
    hook.result.current.handlerOffset.value = -1400;

    const next = [10, 20];
    act(() => {
      hook.rerender({
        props: createProps({
          data: next,
          rawData: next,
          dataLength: next.length,
          rawDataLength: next.length,
          keyExtractor,
        }),
      });
    });

    expect(hook.result.current.handlerOffset.value).toBe(-700);
  });

  it("defers keyed reconciliation until active movement settles", () => {
    const keyExtractor = (item: number) => String(item);
    const initial = [10, 20, 30];
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: {
        props: createProps({
          data: initial,
          rawData: initial,
          dataLength: initial.length,
          rawDataLength: initial.length,
          keyExtractor,
        }),
      },
    });
    hook.result.current.handlerOffset.value = -700;

    const next = [20, 10, 30];
    act(() => {
      hook.result.current.startMovement();
      hook.rerender({
        props: createProps({
          data: next,
          rawData: next,
          dataLength: next.length,
          rawDataLength: next.length,
          keyExtractor,
        }),
      });
    });
    expect(hook.result.current.handlerOffset.value).toBe(-700);

    act(() => hook.result.current.settleMovement());
    expect(hook.result.current.handlerOffset.value).toBe(0);
  });

  it("applies a deferred defaultIndex when data first becomes non-empty", () => {
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: {
        props: createProps({
          data: [],
          rawData: [],
          dataLength: 0,
          rawDataLength: 0,
          defaultIndex: 2,
        }),
      },
    });

    hook.rerender({
      props: createProps({
        data: [0, 1, 2],
        rawData: [0, 1, 2],
        dataLength: 3,
        rawDataLength: 3,
        defaultIndex: 2,
      }),
    });

    expect(hook.result.current.handlerOffset.value).toBe(-1400);
  });
});
