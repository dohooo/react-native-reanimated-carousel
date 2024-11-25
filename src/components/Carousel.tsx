import React from "react";
import { useCommonVariables } from "../hooks/useCommonVariables";
import { useInitProps } from "../hooks/useInitProps";
import { usePropsErrorBoundary } from "../hooks/usePropsErrorBoundary";
import { GlobalStateProvider } from "../store";
import type { ICarouselInstance, TCarouselProps } from "../types";
import { CarouselLayout } from "./CarouselLayout";

const Carousel = React.forwardRef<ICarouselInstance, TCarouselProps<any>>((_props, ref) => {
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

export default Carousel as <T>(props: React.PropsWithChildren<TCarouselProps<T>>) => JSX.Element;
