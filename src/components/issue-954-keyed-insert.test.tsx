import React from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { act, fireEvent, render as renderNative } from "@testing-library/react-native";

import type { CarouselProps } from "../types";
import { Carousel } from "./Carousel";

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

type Page = { id: string };

const events: string[] = [];

function CounterPage({ id }: Page) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    events.push(`mount ${id}`);
    return () => {
      events.push(`unmount ${id}`);
    };
  }, [id]);

  return (
    <View>
      <Text testID={`count-${id}`}>{count}</Text>
      <Pressable testID={`increment-${id}`} onPress={() => setCount((value) => value + 1)} />
    </View>
  );
}

const pages = Object.fromEntries(
  ["a", "b", "c", "d", "e", "x", "y", "z"].map((id) => [id, { id }])
) as Record<string, Page>;

function pick(ids: string) {
  return ids.split("").map((id) => pages[id]!);
}

function TestCarousel(props: Partial<CarouselProps<Page>> & { data: Page[] }) {
  return (
    <Carousel
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CounterPage id={item.id} />}
      style={{ width: 300, height: 200 }}
      {...props}
    />
  );
}

function render(ui: React.ReactElement) {
  return renderNative(ui, { wrapper: GestureHandlerRootView });
}

function flush() {
  act(() => {
    jest.runOnlyPendingTimers();
  });
}

describe("issue #954 keyed items stay mounted when data is inserted before them", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    events.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("keeps the current page's local state when a page is prepended", () => {
    const screen = render(<TestCarousel data={pick("ab")} defaultIndex={1} loop={false} />);
    flush();
    fireEvent.press(screen.getByTestId("increment-b"));
    fireEvent.press(screen.getByTestId("increment-b"));
    expect(screen.getByTestId("count-b").props.children).toBe(2);
    events.length = 0;

    screen.rerender(<TestCarousel data={pick("xab")} defaultIndex={1} loop={false} />);
    flush();

    expect(events).not.toContain("unmount b");
    expect(screen.getByTestId("count-b").props.children).toBe(2);
  });

  it("keeps keyed pages mounted when pages are inserted before them in a loop", () => {
    const screen = render(<TestCarousel data={pick("abc")} defaultIndex={2} loop />);
    flush();
    fireEvent.press(screen.getByTestId("increment-c"));
    events.length = 0;

    screen.rerender(<TestCarousel data={pick("axbc")} defaultIndex={2} loop />);
    flush();

    expect(events.filter((event) => event.startsWith("unmount"))).toEqual([]);
    expect(screen.getByTestId("count-c").props.children).toBe(1);
  });

  it("keeps the current page mounted when several pages are prepended to a render window", () => {
    const screen = render(
      <TestCarousel data={pick("abcde")} defaultIndex={2} loop={false} renderWindowSize={1} />
    );
    flush();
    fireEvent.press(screen.getByTestId("increment-c"));
    events.length = 0;

    screen.rerender(
      <TestCarousel data={pick("xyzabcde")} defaultIndex={2} loop={false} renderWindowSize={1} />
    );
    flush();

    expect(events).not.toContain("unmount c");
    expect(screen.getByTestId("count-c").props.children).toBe(1);
    // Once the ranges catch up, the window holds only the current page again.
    for (const id of ["x", "y", "z", "a", "b", "d", "e"]) {
      expect(screen.queryByTestId(`count-${id}`)).toBeNull();
    }
  });
});
