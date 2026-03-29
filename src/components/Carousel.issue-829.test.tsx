import React from "react";
import { View } from "react-native";

import { render, waitFor } from "@testing-library/react-native";

import type { ICarouselInstance } from "../types";
import Carousel from "./Carousel";

const REANIMATED_RENDER_READ_WARNING = "Reading from `value` during component render";

function interceptReanimatedRenderReadWarning() {
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfg = (global as any).__reanimatedLoggerConfig as
    | { logFunction: (data: { level: number; message: string }) => void }
    | undefined;

  if (!cfg) {
    return {
      getCount: () => count,
      restore: () => {},
    };
  }

  const originalLog = cfg.logFunction;
  cfg.logFunction = (data) => {
    if (data.message.includes(REANIMATED_RENDER_READ_WARNING)) {
      count += 1;
    }
    originalLog(data);
  };

  return {
    getCount: () => count,
    restore: () => {
      cfg.logFunction = originalLog;
    },
  };
}

describe("issue #829 render-phase shared value warning", () => {
  it("does not emit the render-time shared-value warning when getCurrentIndex is read during rerender", async () => {
    const observedIndex = { current: -1 };
    const warning = interceptReanimatedRenderReadWarning();

    const RenderReadIndexProbe = ({ tick }: { tick: number }) => {
      const carouselRef = React.useRef<ICarouselInstance>(null);

      if (tick > 0) {
        observedIndex.current = carouselRef.current?.getCurrentIndex() ?? -1;
      }

      return (
        <Carousel
          ref={carouselRef}
          data={["A", "B", "C"]}
          style={{ width: 300, height: 200 }}
          renderItem={({ index }) => (
            <View testID={`carousel-item-${index}`} style={{ width: 300, height: 200 }} />
          )}
        />
      );
    };

    try {
      const screen = render(<RenderReadIndexProbe tick={0} />);

      await waitFor(() => {
        expect(screen.getByTestId("carousel-item-0")).toBeTruthy();
      });

      screen.rerender(<RenderReadIndexProbe tick={1} />);

      await waitFor(() => {
        expect(observedIndex.current).toBe(0);
      });

      const warningCount = warning.getCount();
      console.log(`ISSUE_829_WARNING_COUNT=${warningCount}`);
      expect(warningCount).toBe(0);
    } finally {
      warning.restore();
    }
  });
});
