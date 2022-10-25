import React from "react";

interface Props {
  shouldUpdate: boolean
}

export const LazyView: React.FC<Props> = (props) => {
  const { shouldUpdate, children } = props;

  if (!shouldUpdate)
    return <></>;

  return <>{children}</>;
};
