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

  it("should keep damping behavior when overscrollEnabled is true and dragging past start", () => {
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

  it("should apply damping when overscrollEnabled is true and dragging past end", () => {
    const next = computeGestureTranslation({
      loop: false,
      overscrollEnabled: true,
      currentTranslation: -600,
      panOffset: -500,
      panTranslation: -100,
      max: 500,
    });

    // boundary = -max = -500, fixed = -500 - (-500) = 0, dynamic = -100 - 0 = -100
    // result = -500 + (-100 * 0.5) = -550
    expect(next).toBe(-550);
  });

  it("should pass through raw value in loop mode", () => {
    const next = computeGestureTranslation({
      loop: true,
      overscrollEnabled: false,
      currentTranslation: 0,
      panOffset: 0,
      panTranslation: 300,
      max: 500,
    });

    expect(next).toBe(300);
  });

  it("should return raw value when within bounds and not looping", () => {
    const next = computeGestureTranslation({
      loop: false,
      overscrollEnabled: true,
      currentTranslation: -200,
      panOffset: -100,
      panTranslation: -50,
      max: 500,
    });

    expect(next).toBe(-150);
  });
});
