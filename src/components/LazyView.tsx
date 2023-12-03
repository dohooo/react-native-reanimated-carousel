import type { PropsWithChildren } from "react";
import React from "react";

interface Props {
  shouldUpdate: boolean
}

export const LazyView: React.FC<PropsWithChildren<Props>> = (props) => {
  const { shouldUpdate, children } = props;

  if (!shouldUpdate)
    return <></>;

  return <>{children}</>;
};
