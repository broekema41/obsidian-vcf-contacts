
export type AuthType = "basic" | "apikey";
export type SyncSelected = "None" | "CardDAV";

export interface ContactsPluginSettings {
  contactsFolder: string;
  defaultHashtag: string;
  processors: ProcessorsSettings
  syncSelected: SyncSelected;
  CardDAV: CardDavSyncSettings;
}


interface CardDavSyncSettings {
  addressBookUrl: string;
  syncEnabled: boolean;
  syncInterval: number;
  authKey: string;
  authType: AuthType;
}

interface ProcessorsSettings {
  [key: string]: string|boolean;
}
