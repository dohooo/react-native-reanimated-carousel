import React from "react";
import { useCommonVariables } from "../hooks/useCommonVariables";
import { useInitProps } from "../hooks/useInitProps";
import { usePropsErrorBoundary } from "../hooks/usePropsErrorBoundary";
import { GlobalStateProvider } from "../store";
import type { CarouselProps, CarouselRef } from "../types";
import { CarouselLayout } from "./CarouselLayout";

const CarouselImpl = React.forwardRef<CarouselRef, CarouselProps<unknown>>((_props, ref) => {
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
