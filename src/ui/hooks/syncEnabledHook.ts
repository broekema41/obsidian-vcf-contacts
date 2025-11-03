import { effect } from "@preact/signals-core";
import * as React from "react";
import { enabled } from "src/sync/sync";

export function useSyncEnabled():boolean {
  const [value, setValue] = React.useState(enabled.value);

  React.useEffect(() => {
    const dispose = effect(() => {
      setValue(enabled.value);
    });
    return () => dispose();
  }, []);
  return value;
}
