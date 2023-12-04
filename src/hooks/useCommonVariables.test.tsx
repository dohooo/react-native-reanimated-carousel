import { renderHook } from "@testing-library/react-hooks";

import { useCommonVariables } from "./useCommonVariables";

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
    expect(hook.result.current.handlerOffset.value).toMatchInlineSnapshot(
      "-0",
    );
  });
});
