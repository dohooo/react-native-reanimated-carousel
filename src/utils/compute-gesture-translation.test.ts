import { computeGestureTranslation } from "./compute-gesture-translation";

describe("computeGestureTranslation", () => {
  it("should clamp right overdrag when overscrollEnabled is false", () => {
    const next = computeGestureTranslation({
      loop: false,
      overscrollEnabled: false,
      currentTranslation: 0,
      panOffset: 0,
      panTranslation: 120,
      max: 500,
    });

    expect(next).toBe(0);
  });

  it("should keep damping behavior when overscrollEnabled is true", () => {
    const next = computeGestureTranslation({
      loop: false,
      overscrollEnabled: true,
      currentTranslation: 20,
      panOffset: 0,
      panTranslation: 120,
      max: 500,
    });

    expect(next).toBe(60);
  });
});
