import { ContactsPluginSettings } from "src/settings/settings";

export const DEFAULT_SETTINGS: ContactsPluginSettings = {
  contactsFolder: '',
  defaultHashtag: '',
  processors: {},
  syncSelected: 'None',
  syncEnabled: false,
  groupInsights: true,
  CardDAV: {
    addressBookUrl: '',
    syncInterval: 900,
    authKey: '',
    authType: 'apikey'
  }
}

