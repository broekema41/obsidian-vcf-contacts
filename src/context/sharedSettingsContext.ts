import { signal } from "@preact/signals-core";
import { ContactsPluginSettings } from "src/settings/settings.d";

export const settings = signal<ContactsPluginSettings | undefined>(undefined);

export function setSettings(settingsInput: ContactsPluginSettings) {
  // Making sure the signal fires by assigning new object.
  settings.value =  { ...{}, ...settingsInput};
}

export function getSettings(): ContactsPluginSettings {
  const current = settings.peek(); // avoid tracking if used in non-reactive contexts
  if (!current) throw new Error('Plugin context has not been set.')
  return current;
}

export function clearSettings() {
  settings.value = undefined;
}
