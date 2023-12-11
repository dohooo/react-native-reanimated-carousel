import { useSharedValue } from "react-native-reanimated";

import { renderHook } from "@testing-library/react-hooks";

import { useVisibleRanges } from "./useVisibleRanges";

const viewSize = 393;

describe("useVisibleRanges", () => {
  it("should only display the front of the list when loop is false", async () => {
    const hook = renderHook(() => {
      const translation = useSharedValue(-0);
      const range = useVisibleRanges({
        total: 10,
        translation,
        viewSize,
        windowSize: 4,
        loop: false,
      });

      return range;
    });

    const expected = hook.result.current.value;

    expect(expected).toMatchInlineSnapshot(`
            {
              "negativeRange": [
                -3,
                0,
              ],
              "positiveRange": [
                0,
                3,
              ],
            }
        `);
  });

  it("should display the rear of the list and the front of the list when loop is true", async () => {
    const hook = renderHook(() => {
      const translation = useSharedValue(-0);
      const range = useVisibleRanges({
        total: 10,
        translation,
        viewSize,
        windowSize: 4,
        loop: true,
      });

      return range;
    });

    const expected = hook.result.current.value;

    expect(expected).toMatchInlineSnapshot(`
            {
              "negativeRange": [
                8,
                9,
              ],
              "positiveRange": [
                0,
                2,
              ],
            }
        `);
  });

  it("should shows the increased range of the list when the loop is false and swiped the carousel.", async () => {
    const slide0hook = renderHook(() => {
      const translation = useSharedValue(-0 * viewSize);
      const range = useVisibleRanges({
        total: 10,
        translation,
        viewSize,
        windowSize: 4,
        loop: false,
      });

      return range;
    }).result.current.value;

    const slide1hook = renderHook(() => {
      const translation = useSharedValue(-1 * viewSize);
      const range = useVisibleRanges({
        total: 10,
        translation,
        viewSize,
        windowSize: 4,
        loop: false,
      });

      return range;
    }).result.current.value;

    const slide2hook = renderHook(() => {
      const translation = useSharedValue(-2 * viewSize);
      const range = useVisibleRanges({
        total: 10,
        translation,
        viewSize,
        windowSize: 4,
        loop: false,
      });

      return range;
    }).result.current.value;

    const slide3hook = renderHook(() => {
      const translation = useSharedValue(-3 * viewSize);
      const range = useVisibleRanges({
        total: 10,
        translation,
        viewSize,
        windowSize: 4,
        loop: false,
      });

      return range;
    }).result.current.value;

    // [0,3] Display the 0,1,2,3 items.
    expect(slide0hook).toMatchInlineSnapshot(`
            {
              "negativeRange": [
                -3,
                0,
              ],
              "positiveRange": [
                0,
                3,
              ],
            }
        `);

    // [1,4] Display the 1,2,3,4 items.
    expect(slide1hook).toMatchInlineSnapshot(`
            {
              "negativeRange": [
                -2,
                1,
              ],
              "positiveRange": [
                1,
                4,
              ],
            }
        `);

    // [2,5] Display the 2,3,4,5 items.
    expect(slide2hook).toMatchInlineSnapshot(`
            {
              "negativeRange": [
                -1,
                2,
              ],
              "positiveRange": [
                2,
                5,
              ],
            }
        `);

    // [3.6] Display the 3,4,5,6 items.
    expect(slide3hook).toMatchInlineSnapshot(`
            {
              "negativeRange": [
                0,
                3,
              ],
              "positiveRange": [
                3,
                6,
              ],
            }
        `);
  });
});
