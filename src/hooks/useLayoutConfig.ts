import React from "react";

import { Layouts } from "../layouts";
import type { CarouselItemAnimation } from "../types";
import type { InitializedCarouselProps } from "./useInitProps";

type LayoutConfigOptions<Item> = InitializedCarouselProps<Item> & { size: number };

export function useLayoutConfig<Item>(options: LayoutConfigOptions<Item>): CarouselItemAnimation {
  const { dataLength, directionSign, layout, orientation, size } = options;
  const isVertical = orientation === "vertical";

  return React.useMemo(() => {
    const baseConfig = { size, isVertical, directionSign };
    switch (layout?.type) {
      case "parallax":
        return Layouts.parallax(baseConfig, layout);
      case "horizontal-stack":
        return Layouts.horizontalStack(
          {
            ...layout,
            visibleCount: layout.visibleCount ?? Math.max(0, dataLength - 1),
          },
          directionSign
        );
      case "vertical-stack":
        return Layouts.verticalStack({
          ...layout,
          visibleCount: layout.visibleCount ?? Math.max(0, dataLength - 1),
        });
      default:
        return Layouts.normal(baseConfig);
    }
  }, [dataLength, directionSign, isVertical, layout, size]);
}
