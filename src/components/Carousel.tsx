import React from "react";
import { useCommonVariables } from "../hooks/useCommonVariables";
import { useInitProps } from "../hooks/useInitProps";
import { useLegacyPropsWarning } from "../hooks/useLegacyPropsWarning";
import { usePropsErrorBoundary } from "../hooks/usePropsErrorBoundary";
import { GlobalStateProvider } from "../store";
import type { CarouselProps, CarouselRef } from "../types";
import { LEGACY_CAROUSEL_PROPS } from "../utils/legacy-props";
import { CarouselLayout } from "./CarouselLayout";

const CarouselImpl = React.forwardRef<CarouselRef, CarouselProps<unknown>>((_props, ref) => {
  useLegacyPropsWarning("Carousel", _props, LEGACY_CAROUSEL_PROPS);
  const props = useInitProps(_props);
  const { dataLength } = props;
  const commonVariables = useCommonVariables(props);
  usePropsErrorBoundary({ ...props, dataLength });

  return (
    <GlobalStateProvider value={{ props, common: commonVariables }}>
      <CarouselLayout ref={ref} />
    </GlobalStateProvider>
  );
});

type CarouselComponent = <T>(
  props: CarouselProps<T> & {
    ref?: React.Ref<CarouselRef>;
  }
) => React.ReactElement;

export const Carousel = CarouselImpl as CarouselComponent;
