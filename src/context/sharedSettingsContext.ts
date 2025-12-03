import { signal } from "@preact/signals-core";
import { insightService } from "src/insights/insightService";
import { DEFAULT_SETTINGS } from "src/settings/setting";
import { ContactsPluginSettings } from "src/settings/settings.d";
import { deepCloneObject } from "src/util/deepCloneObject";

export const settings = signal<ContactsPluginSettings | undefined>(undefined);
let saveData: (data: any) => Promise<void>;

export async function initSettings(
  loadData: () => Promise<any>,   // a callable async function
  mySaveData: (data: any) => Promise<void> // another callable async function
) {

  const insightsSetting = insightService.settings();
  const insightsSettingDefaults = insightsSetting.reduce((acc:Record<string, string|boolean>, setting) => {
    acc[setting.settingPropertyName] = setting.settingDefaultValue;
    return acc;
  }, {} as Record<string, string>);


  saveData = mySaveData;
  const loaded = await loadData() ?? {};
  const initializedSettings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      CardDAV: {
        ...DEFAULT_SETTINGS.CardDAV,
        ...(loaded.CardDAV ?? {})
      },
      processors: {
        ...insightsSettingDefaults,
        ...(loaded.processors ?? {})
      }
    };
    await setSettings(initializedSettings);
}

export async function updateSetting(path: string, value: string | boolean) {
  const updated = deepCloneObject(getSettings()); // guaranteed new reference
  const keys = path.split(".");
  let target: any = updated;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in target) || typeof target[key] !== "object" || target[key] === null) {
      throw new Error(`Invalid settings path: ${path}`);
    }
    target = target[key];
  }

  const lastKey = keys[keys.length - 1];
  if (!(lastKey in target)) {
    throw new Error(`Invalid settings path: ${path} (missing final key "${lastKey}")`);
  }

  target[lastKey] = value;
  await setSettings(updated);
}

export async function setSettings(settingsInput: ContactsPluginSettings) {
  if (!saveData) throw new Error('Plugin context has not been set.')
  // Making sure the signal fires by assigning new object.
  const updatedSettings = deepCloneObject(settingsInput);
  await saveData(updatedSettings)
  settings.value = updatedSettings;
}

export function getSettings(): ContactsPluginSettings {
  const current = settings.peek(); // avoid tracking if used in non-reactive contexts
  if (!current) throw new Error('Plugin context has not been set.')
  return current;
}

export function clearSettings() {
  settings.value = undefined;
}
