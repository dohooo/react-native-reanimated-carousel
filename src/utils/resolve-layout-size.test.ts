import { resolveLayoutSize } from "./resolve-layout-size";

describe("resolveLayoutSize", () => {
  it("keeps main-axis size responsive in auto-measurement mode", () => {
    const result = resolveLayoutSize({
      vertical: false,
      styleWidth: undefined,
      styleHeight: 200,
      resolvedSize: 320,
    });

    expect(result.computedWidth).toBe("100%");
    expect(result.computedHeight).toBe(200);
  });

  it("keeps cross-axis fallback to 100% when not explicitly provided", () => {
    const result = resolveLayoutSize({
      vertical: true,
      styleWidth: undefined,
      styleHeight: undefined,
      resolvedSize: 240,
    });

    expect(result.computedWidth).toBe("100%");
    expect(result.computedHeight).toBe("100%");
  });

  it("keeps legacy explicit width fixed on the main axis", () => {
    const result = resolveLayoutSize({
      vertical: false,
      styleWidth: undefined,
      styleHeight: 200,
      resolvedSize: 360,
      legacyWidth: 360,
    });

    expect(result.computedWidth).toBe(360);
    expect(result.computedHeight).toBe(200);
  });
});
