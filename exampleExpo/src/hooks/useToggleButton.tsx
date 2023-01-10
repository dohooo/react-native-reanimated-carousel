import * as React from "react";

import SButton from "../components/SButton";

export function useToggleButton(opts: {
  defaultValue: boolean
  buttonTitle: string
}) {
  const { buttonTitle, defaultValue = false } = opts;
  const [status, setStatus] = React.useState(defaultValue);

  const button = React.useMemo(() => {
    return (
      <SButton onPress={() => setStatus(!status)}>
        {buttonTitle}: {`${status}`}
      </SButton>
    );
  }, [status, buttonTitle]);

  return {
    status,
    button,
  };
}
