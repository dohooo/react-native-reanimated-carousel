import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { render as renderNative } from "@testing-library/react-native";

import { Carousel } from "./Carousel";
import { Pagination } from "./Pagination";

function render(ui: React.ReactElement) {
  return renderNative(ui, { wrapper: GestureHandlerRootView });
}

function legacyWarnings(spy: jest.SpyInstance) {
  return spy.mock.calls
    .map(([message]) => String(message))
    .filter((message) => message.includes("v4 props that v5 ignores"));
}

// v4 code is untyped from v5's point of view, so the tests pass it through `any`.
const LegacyCarousel = Carousel as React.ComponentType<any>;
const LegacyPagination = Pagination as React.ComponentType<any>;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("v4 props in development", () => {
  it("names each ignored v4 Carousel prop and its v5 replacement once", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const element = (
      <LegacyCarousel
        data={["A", "B"]}
        renderItem={() => <View />}
        style={{ width: 300, height: 200 }}
        width={300}
        mode="parallax"
        autoPlay
      />
    );

    const screen = render(element);
    screen.rerender(element);

    const warnings = legacyWarnings(warnSpy);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Carousel received v4 props that v5 ignores");
    expect(warnings[0]).toContain("`width` (use `style.width`)");
    expect(warnings[0]).toContain("`autoPlay` (use `autoplay`)");
    expect(warnings[0]).toContain("`mode` (use `layout`)");
    expect(warnings[0]).toContain("npx --yes rnrc-codemod v5 .");
    expect(warnings[0]).toContain("https://rn-carousel.dev/migration-v5");
  });

  it("stays quiet for v5 props", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Carousel
        data={["A", "B"]}
        renderItem={() => <View />}
        style={{ width: 300, height: 200 }}
        autoplay
        layout={{ type: "parallax" }}
        scrollEnabled
      />
    );

    expect(legacyWarnings(warnSpy)).toEqual([]);
  });

  it("hints at relativeProgress when renderItem reads animationValue, without exposing it", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const seen: Array<{ animationValue: unknown; keys: string[] }> = [];

    render(
      <LegacyCarousel
        data={["A", "B"]}
        renderItem={(info: any) => {
          seen.push({ animationValue: info.animationValue, keys: Object.keys(info) });
          return <View />;
        }}
        style={{ width: 300, height: 200 }}
      />
    );

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every(({ animationValue }) => animationValue === undefined)).toBe(true);
    expect(seen[0]?.keys.sort()).toEqual(["index", "item", "relativeProgress"]);
    const hints = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes("renamed to `relativeProgress`")
    );
    expect(hints).toHaveLength(1);
  });

  it("names ignored v4 Pagination props once", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    function Harness() {
      const progress = useSharedValue(0);
      return <LegacyPagination count={3} progress={progress} size={8} horizontal />;
    }

    const screen = render(<Harness />);
    screen.rerender(<Harness />);

    const warnings = legacyWarnings(warnSpy);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Pagination received v4 props that v5 ignores");
    expect(warnings[0]).toContain("`horizontal` (use `orientation`)");
    expect(warnings[0]).toContain("`size` (use `dotStyle.width` and `dotStyle.height`)");
  });

  it("explains the v4 `data` prop when Pagination has no count", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    function Harness() {
      const progress = useSharedValue(0);
      return <LegacyPagination data={[1, 2, 3]} progress={progress} />;
    }

    expect(() => render(<Harness />)).toThrow(
      "Pagination count must be a non-negative integer. It received v4 props that v5 ignores: `data` (use `count`)."
    );
  });
});
