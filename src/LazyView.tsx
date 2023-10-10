import React, { type PropsWithChildren, useState } from "react";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";

import type { IVisibleRanges } from "./hooks/useVisibleRanges";

interface Props {
  index: number
  visibleRanges: IVisibleRanges
}

export const LazyView: React.FC<PropsWithChildren<Props>> = (props) => {
  const { index, visibleRanges, children } = props;

  const [shouldRender, setShouldRender] = useState<boolean>(false);

  useAnimatedReaction(
    () => {
      const { negativeRange, positiveRange } = visibleRanges.value;
      return (index >= negativeRange[0] && index <= negativeRange[1]) || (index >= positiveRange[0] && index <= positiveRange[1]);
    },
    (currentValue, previousValue) => {
      if (currentValue !== previousValue)
        runOnJS(setShouldRender)(currentValue);
    },
    [index, visibleRanges],
  );

  if (!shouldRender)
    return null;

  return <>{children}</>;
};
