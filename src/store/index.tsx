import React from "react";

import { SharedValue, useSharedValue } from "react-native-reanimated";
import type { TInitializeCarouselProps } from "../hooks/useInitProps";

type ItemDimensions = Record<number, { width: number; height: number }>;

export interface IContext {
  props: TInitializeCarouselProps<any>;
  common: {
    size: number;
    validLength: number;
  };
  layout: {
    containerSize: SharedValue<{ width: number; height: number }>;
    updateContainerSize: (dimensions: { width: number; height: number }) => void;
    itemDimensions: SharedValue<ItemDimensions>;
    updateItemDimensions: (index: number, dimensions: { width: number; height: number }) => void;
  };
}

export const GlobalStateContext = React.createContext<IContext>({} as IContext);

export const GlobalStateProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: Pick<IContext, "props" | "common">;
}) => {
  const containerSize = useSharedValue<{ width: number; height: number }>({ width: 0, height: 0 });
  const itemDimensions = useSharedValue<ItemDimensions>({});

  const updateItemDimensions = (index: number, dimensions: { width: number; height: number }) => {
    "worklet";

    itemDimensions.value = { ...itemDimensions.value, [index]: dimensions };
  };

  const updateContainerSize = (dimensions: { width: number; height: number }) => {
    "worklet";
    containerSize.value = dimensions;
  };

  return (
    <GlobalStateContext.Provider
      value={{
        ...value,
        layout: { containerSize, itemDimensions, updateItemDimensions, updateContainerSize },
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = React.useContext(GlobalStateContext);

  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }

  return context;
};
