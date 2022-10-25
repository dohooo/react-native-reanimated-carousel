import React from "react";

import type { TInitializeCarouselProps } from "../hooks/useInitProps";

export interface IContext {
  props: TInitializeCarouselProps<any>
  common: {
    size: number
    validLength: number
  }
}

export const CTX = React.createContext<IContext>({} as IContext);
