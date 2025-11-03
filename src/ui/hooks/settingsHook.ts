import { effect } from "@preact/signals-core";
import * as React from "react";
import { settings } from "src/context/sharedSettingsContext";
import { ContactsPluginSettings } from "src/settings/settings";

export function useSettings():ContactsPluginSettings | undefined {
  const [value, setValue] = React.useState<ContactsPluginSettings | undefined>(settings.value);

  React.useEffect(() => {
    const dispose = effect(() => {
      setValue(settings.value);
    });
    return () => dispose();
  }, []);
  return value;
}
