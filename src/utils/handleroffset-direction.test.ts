import { useSharedValue } from "react-native-reanimated";

import { renderHook } from "@testing-library/react-hooks";

import { handlerOffsetDirection } from "./handleroffset-direction";

describe("handlerOffsetDirection", () => {
  it("should return -1 when default value equals to zero", () => {
    const result = renderHook(() => {
      const handlerOffsetAnimVal = useSharedValue(0);
      return handlerOffsetDirection(handlerOffsetAnimVal);
    });

    expect(result.result.current).toBe(-1);
  });

  it("should return 1 when default value is greater than zero", () => {
    const result = renderHook(() => {
      const handlerOffsetAnimVal = useSharedValue(1);
      return handlerOffsetDirection(handlerOffsetAnimVal);
    });

    expect(result.result.current).toBe(1);
  });

  it("should return -1 when default value is less than zero", () => {
    const result = renderHook(() => {
      const handlerOffsetAnimVal = useSharedValue(-1);
      return handlerOffsetDirection(handlerOffsetAnimVal);
    });

    expect(result.result.current).toBe(-1);
  });

  it("should return 1 when default value equals to zero and fixedDirection is negative", () => {
    const result = renderHook(() => {
      const handlerOffsetAnimVal = useSharedValue(-1);
      return handlerOffsetDirection(handlerOffsetAnimVal, "positive");
    });

    expect(result.result.current).toBe(1);
  });

  it("should return -1 when default value is greater than zero and fixedDirection is negative", () => {
    const result = renderHook(() => {
      const handlerOffsetAnimVal = useSharedValue(1);
      return handlerOffsetDirection(handlerOffsetAnimVal, "negative");
    });

    expect(result.result.current).toBe(-1);
  });
});
