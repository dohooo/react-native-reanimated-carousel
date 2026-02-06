import { sanitizeAnimationStyle } from "./sanitize-animation-style";

describe("sanitizeAnimationStyle", () => {
  it("rounds zIndex to an integer", () => {
    const style = sanitizeAnimationStyle({
      transform: [{ translateX: 12 }],
      zIndex: 3.7,
    });

    expect(style.zIndex).toBe(4);
  });

  it("drops invalid zIndex values", () => {
    const style = sanitizeAnimationStyle({
      // invalid value from userland worklet should not flow to native styles
      zIndex: Number.NaN,
    });

    expect(style).not.toHaveProperty("zIndex");
  });
});
