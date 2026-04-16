
export type AuthType = "basic" | "apikey";
export type SyncSelected = "None" | "CardDAV";

export interface ContactsPluginSettings {
  contactsFolder: string;
  defaultHashtag: string;
  processors: ProcessorsSettings
  syncSelected: SyncSelected;
  syncEnabled: boolean;
  groupInsights: boolean;
  CardDAV: CardDavSyncSettings;
  createFieldsKeys: string[]
}


interface CardDavSyncSettings {
  addressBookUrl: string;
  syncInterval: number;
  authKey: string;
  authType: AuthType;
}

interface ProcessorsSettings {
  [key: string]: string|boolean;
}


