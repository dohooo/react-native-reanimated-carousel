import { renderHook } from "@testing-library/react-hooks";

import { useCommonVariables } from "./useCommonVariables";
import { TInitializeCarouselProps } from "./useInitProps";

type UseCommonVariablesInput = Parameters<typeof useCommonVariables>[0];

const input = {
  vertical: false,
  width: 700,
  height: 350,
  loop: true,
  enabled: true,
  testID: "xxx",
  style: {
    width: "100%",
  },
  autoPlay: false,
  autoPlayInterval: 2000,
  data: [0, 1, 2, 3],
  renderItem: () => null,
  pagingEnabled: true,
  defaultIndex: 0,
  autoFillData: true,
  dataLength: 4,
  rawData: [0, 1, 2, 3],
  rawDataLength: 4,
  scrollAnimationDuration: 500,
  snapEnabled: true,
  overscrollEnabled: true,
} as unknown as UseCommonVariablesInput;

describe("useCommonVariables", () => {
  it("should return the correct values", async () => {
    const hook = renderHook(() => useCommonVariables(input));

    expect(hook.result.current.size).toMatchInlineSnapshot("700");
    expect(hook.result.current.validLength).toMatchInlineSnapshot("3");
    expect(hook.result.current.handlerOffset.value).toMatchInlineSnapshot("-0");
  });

  it("should handle vertical orientation", () => {
    const verticalInput = {
      ...input,
      vertical: true,
    } as TInitializeCarouselProps<any>;

    const hook = renderHook(() => useCommonVariables(verticalInput));

    expect(hook.result.current.size).toBe(350); // Should use height instead of width
    expect(hook.result.current.validLength).toBe(3);
  });

  it("should calculate defaultHandlerOffsetValue correctly with non-zero defaultIndex", () => {
    const inputWithDefaultIndex = {
      ...input,
      defaultIndex: 2,
    };

    const hook = renderHook(() => useCommonVariables(inputWithDefaultIndex));

    expect(hook.result.current.handlerOffset.value).toBe(-1400); // -2 * 700
  });

  it("should use custom defaultScrollOffsetValue when provided", () => {
    const customOffset = {
      value: -500,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      modify: jest.fn(),
    };
    const inputWithCustomOffset = {
      ...input,
      defaultScrollOffsetValue: customOffset,
    };

    const hook = renderHook(() => useCommonVariables(inputWithCustomOffset));

    expect(hook.result.current.handlerOffset).toBe(customOffset);
    expect(hook.result.current.handlerOffset.value).toBe(-500);
  });

  it("should handle single data item", () => {
    const singleItemInput = {
      ...input,
      dataLength: 1,
      data: [0],
    };

    const hook = renderHook(() => useCommonVariables(singleItemInput));

    expect(hook.result.current.validLength).toBe(0); // dataLength - 1
  });

  it("should handle zero dataLength", () => {
    const emptyInput = {
      ...input,
      dataLength: 0,
      data: [],
    };

    const hook = renderHook(() => useCommonVariables(emptyInput));

    expect(hook.result.current.validLength).toBe(-1); // dataLength - 1
  });

  it("should handle negative defaultIndex", () => {
    const negativeIndexInput = {
      ...input,
      defaultIndex: -1,
    };

    const hook = renderHook(() => useCommonVariables(negativeIndexInput));

    expect(hook.result.current.handlerOffset.value).toBe(-700); // -Math.abs(-1 * 700)
  });

  it("should handle loop disabled", () => {
    const noLoopInput = {
      ...input,
      loop: false,
    };

    const hook = renderHook(() => useCommonVariables(noLoopInput));

    expect(hook.result.current.size).toBe(700);
    expect(hook.result.current.validLength).toBe(3);
  });

  it("should update when props change", () => {
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: { props: input },
    });

    expect(hook.result.current.size).toBe(700);

    // Update width
    const updatedInput = {
      ...input,
      width: 800,
    };

    hook.rerender({ props: updatedInput });
    expect(hook.result.current.size).toBe(800);
  });

  it("should handle dataLength changes", () => {
    const hook = renderHook(({ props }) => useCommonVariables(props), {
      initialProps: { props: input },
    });

    expect(hook.result.current.validLength).toBe(3);

    // Update dataLength
    const updatedInput = {
      ...input,
      dataLength: 6,
    };

    hook.rerender({ props: updatedInput });
    expect(hook.result.current.validLength).toBe(5);
  });

  it("should handle zero size (edge case)", () => {
    const zeroSizeInput = {
      ...input,
      width: 0,
    };

    const hook = renderHook(() => useCommonVariables(zeroSizeInput));

    expect(hook.result.current.size).toBe(0);
    expect(hook.result.current.handlerOffset.value).toBe(-0); // -Math.abs(0 * 0)
  });

  it("should handle large defaultIndex", () => {
    const largeIndexInput = {
      ...input,
      defaultIndex: 10,
    };

    const hook = renderHook(() => useCommonVariables(largeIndexInput));

    expect(hook.result.current.handlerOffset.value).toBe(-7000); // -Math.abs(10 * 700)
  });

  it("should handle vertical with zero height", () => {
    const verticalZeroHeightInput = {
      ...input,
      vertical: true,
      height: 0,
    } as TInitializeCarouselProps<any>;

    const hook = renderHook(() => useCommonVariables(verticalZeroHeightInput));

    expect(hook.result.current.size).toBe(0);
  });

  it("should handle floating point dimensions", () => {
    const floatInput = {
      ...input,
      width: 700.5,
      height: 350.25,
    };

    const hook = renderHook(() => useCommonVariables(floatInput));

    expect(hook.result.current.size).toBe(700.5);
  });

  it("should calculate validLength correctly for different data lengths", () => {
    const testCases = [
      { dataLength: 0, expected: -1 },
      { dataLength: 1, expected: 0 },
      { dataLength: 5, expected: 4 },
      { dataLength: 100, expected: 99 },
    ];

    for (const { dataLength, expected } of testCases) {
      const testInput = {
        ...input,
        dataLength,
      };

      const hook = renderHook(() => useCommonVariables(testInput));
      expect(hook.result.current.validLength).toBe(expected);
    }
  });
});
