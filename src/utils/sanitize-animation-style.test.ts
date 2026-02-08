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

  it("returns empty object for null/undefined input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeAnimationStyle(null as any)).toEqual({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeAnimationStyle(undefined as any)).toEqual({});
  });

  it("strips non-number zIndex (e.g. string)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style = sanitizeAnimationStyle({ opacity: 1, zIndex: "auto" as any });
    expect(style).not.toHaveProperty("zIndex");
    expect(style).toHaveProperty("opacity", 1);
  });

  it("preserves style without zIndex unchanged", () => {
    const style = sanitizeAnimationStyle({ opacity: 0.5 });
    expect(style).toEqual({ opacity: 0.5 });
  });
});
