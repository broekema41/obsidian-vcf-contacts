import { settings } from "src/context/sharedSettingsContext";
import { carddavGenericAdapter } from "src/sync/adapters/carddavGeneric";

export const adapters = {
  None: undefined,
  CardDAV: carddavGenericAdapter()
}

export function getCurrentAdapter() {
  const setting = settings.value;
  if (!setting) return undefined;
  if (setting.syncSelected === "None") return undefined;
  return adapters[setting.syncSelected];
}
