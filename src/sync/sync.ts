import { TFile } from "obsidian";
import { string } from "prop-types";
import { Contact, getFrontmatterFromFiles } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { getSettings, onSettingsChange } from "src/context/sharedSettingsContext";
import { ContactsPluginSettings } from "src/settings/settings";
import { adapters } from "src/sync/adapters";
import { VCardMeta } from "src/sync/adapters/adapter";
import { fnOutOfString, uidOutOfString } from "src/util/vcard";

let cachedSettings: ContactsPluginSettings|undefined = undefined;

function startSettingsListener() {
  onSettingsChange(() => {
    cachedSettings = getSettings()
  })
}

const settings = {
  get current():ContactsPluginSettings {
    if (!cachedSettings) {
      cachedSettings = getSettings()
      startSettingsListener();
    }
    return cachedSettings;
  }
};

export async function getUnknownFromRemote(currentContacts: Contact[]): Promise<VCardMeta[]> {
   return Promise.resolve([{
     href: '',
     etag: '',
     lastModified: new Date(),
     uid:  '',
     fn:  ''
   }])
}


export async function pullFromRemote(href: string) {

}

export async function deleteOnRemote(href: string) {

}

export async function syncContact(contact: Contact) {

}



async function getList() {
  const setting = settings.current;
  return adapters[setting.syncSelected]?.getMetaList();
}

async function getMetaByUID(uid: string): Promise<void> {
  const setting = settings.current;
  const adapter = adapters[setting.syncSelected];
  if(adapter) {
    const res = adapter.getMetaByUid(uid);
  }
}

export async function singlePush(file: TFile) {
  const setting = settings.current;
  const frontmatter = (await getFrontmatterFromFiles([file]))[0]
  const adapter = adapters[setting.syncSelected];

  if(adapter) {
    const result = await vcard.toString([file]);
    if (result.errors.length > 0) {
      return;
    }
    await adapter.push({
      uid: frontmatter.data['UID'].split(':').pop(),
      raw: result.vcards
    })
  }


}
