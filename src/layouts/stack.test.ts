import { horizontalStackLayout } from "./stack";

describe("horizontalStackLayout", () => {
  it("should make the rotateZDeg works properly when it is passed in horizontal-stack mode through modeConfig", () => {
    const screenWidth = 375;

    const calculator = horizontalStackLayout({
      showLength: 3,
      snapDirection: "left",
      moveSize: screenWidth,
      stackInterval: 18,
      scaleInterval: 0.04,
      opacityInterval: 0.1,
      rotateZDeg: 30,
    });

    expect(calculator(-0.5)).toMatchInlineSnapshot(`
      {
        "opacity": 0.625,
        "transform": [
          {
            "translateX": -187.5,
          },
          {
            "scale": 1,
          },
          {
            "rotateZ": "-15deg",
          },
        ],
        "zIndex": 150,
      }
    `);

    expect(calculator(-1)).toMatchInlineSnapshot(`
      {
        "opacity": 0.25,
        "transform": [
          {
            "translateX": -375,
          },
          {
            "scale": 1,
          },
          {
            "rotateZ": "-30deg",
          },
        ],
        "zIndex": 200,
      }
    `);
  });
});
