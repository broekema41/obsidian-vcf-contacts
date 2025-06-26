import { insightService } from "src/insights/insightService";
import { ContactsPluginSettings } from "src/settings/settings";

const insightsSetting = insightService.settings();
const insightsSettingDefaults = insightsSetting.reduce((acc:Record<string, string|boolean>, setting) => {
  acc[setting.settingPropertyName] = setting.settingDefaultValue;
  return acc;
}, {} as Record<string, string>);

export const DEFAULT_SETTINGS: ContactsPluginSettings = {
  contactsFolder: '',
  defaultHashtag: '',
  processors: insightsSettingDefaults,
  syncSelected: 'None',
  CardDAV: {
    addressBookUrl: '',
    syncEnabled: false,
    syncInterval: 900,
    authKey: '',
    authType: 'apikey'
  }
}

