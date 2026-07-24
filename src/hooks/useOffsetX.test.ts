import { useSharedValue } from "react-native-reanimated";

import { renderHook } from "@testing-library/react-hooks";

import type { OffsetOptions } from "./useOffsetX";
import { useOffsetX } from "./useOffsetX";
import type { VisibleRangesValue } from "./useVisibleRanges";

describe("useSharedValue", () => {
  it("should return the correct values", async () => {
    const hook = renderHook(() => {
      const range = useSharedValue({
        negativeRange: [7, 9],
        positiveRange: [0, 3],
      }) as VisibleRangesValue;
      const inputs: Array<{
        config: OffsetOptions;
        range: VisibleRangesValue;
      }> = Array.from({ length: 10 }).map((_, index) => ({
        config: {
          dataLength: 10,
          handlerOffset: useSharedValue(-0),
          index,
          loop: false,
          size: 393,
        },
        range,
      }));

      return inputs.map((input) => {
        const { config, range } = input;

        return useOffsetX(config, range);
      });
    });

    const expected = hook.result.current.map((v) => v.value).slice();

    expect(expected).toMatchInlineSnapshot(`
            [
              0,
              393,
              786,
              1179,
              9007199254740991,
              9007199254740991,
              9007199254740991,
              2751,
              3144,
              3537,
            ]
        `);
  });
});
