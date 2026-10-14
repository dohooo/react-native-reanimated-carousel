import React from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { act, render as renderNative } from "@testing-library/react-native";

import type { CarouselProps } from "../types";
import { Carousel } from "./Carousel";
import { Pagination } from "./Pagination";

type HookName = "useAnimatedStyle" | "useDerivedValue" | "useAnimatedReaction";

const mockHookCalls: { hook: HookName; dependencies: unknown }[] = [];

// Reanimated >= 4.6 warns "dependencies should only be used in web implementation." whenever a
// native hook receives a dependency array. Record what each hook receives so the test can assert
// the condition behind that warning without depending on the installed Reanimated version.
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated");
  const overrides = {
    useAnimatedStyle: (updater: unknown, dependencies: unknown, ...rest: unknown[]) => {
      mockHookCalls.push({ hook: "useAnimatedStyle", dependencies });
      return actual.useAnimatedStyle(updater, dependencies, ...rest);
    },
    useDerivedValue: (updater: unknown, dependencies: unknown) => {
      mockHookCalls.push({ hook: "useDerivedValue", dependencies });
      return actual.useDerivedValue(updater, dependencies);
    },
    useAnimatedReaction: (prepare: unknown, react: unknown, dependencies: unknown) => {
      mockHookCalls.push({ hook: "useAnimatedReaction", dependencies });
      return actual.useAnimatedReaction(prepare, react, dependencies);
    },
  };
  // The module exposes getter-only exports, so copy descriptors instead of spreading.
  const descriptors = Object.getOwnPropertyDescriptors(actual);
  for (const [name, value] of Object.entries(overrides)) {
    descriptors[name] = { configurable: true, enumerable: true, value };
  }
  return Object.defineProperties({}, descriptors);
});

{
  const cfg = (
    global as {
      __reanimatedLoggerConfig?: {
        logFunction: (data: { message: string }) => void;
      };
    }
  ).__reanimatedLoggerConfig;
  if (cfg) {
    const originalLog = cfg.logFunction;
    cfg.logFunction = (data) => {
      if (data.message.includes("measure() cannot be used with Jest")) return;
      originalLog(data);
    };
  }
}

const layouts: CarouselProps<string>["layout"][] = [
  undefined,
  { type: "parallax" },
  { type: "horizontal-stack" },
  { type: "vertical-stack" },
];

function CarouselWithPagination({ layout }: { layout: CarouselProps<string>["layout"] }) {
  const progress = useSharedValue(0);

  return (
    <>
      <Carousel
        data={["A", "B", "C"]}
        renderItem={({ item }) => <View accessibilityLabel={item} />}
        style={{ width: 300, height: 200 }}
        progress={progress}
        onProgressChange={() => {}}
        autoplay
        loop
        {...(layout ? { layout } : {})}
      />
      <Pagination count={3} progress={progress} onPress={() => {}} />
    </>
  );
}

function renderEveryLayout() {
  for (const layout of layouts) {
    const screen = renderNative(<CarouselWithPagination layout={layout} />, {
      wrapper: GestureHandlerRootView,
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    screen.unmount();
  }
}

describe("issue #953 Reanimated hook dependencies", () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.useFakeTimers();
    mockHookCalls.length = 0;
  });

  afterEach(() => {
    Platform.OS = originalOS;
    jest.useRealTimers();
  });

  it.each(["ios", "android"] as const)(
    "does not pass dependency arrays to Reanimated hooks on %s",
    (os) => {
      Platform.OS = os;

      renderEveryLayout();

      expect(mockHookCalls.length).toBeGreaterThan(0);
      const hooksWithDependencies = mockHookCalls
        .filter((call) => call.dependencies !== undefined)
        .map((call) => call.hook);
      expect(hooksWithDependencies).toEqual([]);
    }
  );

  it("keeps dependency arrays on web for Reanimated without the Babel plugin", () => {
    Platform.OS = "web";

    renderEveryLayout();

    const hooks = new Set(
      mockHookCalls.filter((call) => Array.isArray(call.dependencies)).map((call) => call.hook)
    );
    expect(hooks).toEqual(new Set(["useAnimatedStyle", "useDerivedValue", "useAnimatedReaction"]));
    const hooksWithoutDependencies = mockHookCalls
      .filter((call) => call.dependencies === undefined)
      .map((call) => call.hook);
    expect(hooksWithoutDependencies).toEqual([]);
  });
});
