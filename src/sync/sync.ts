import { effect, signal } from "@preact/signals-core";
import { TFile } from "obsidian";
import { Contact, getFrontmatterFromFiles } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { settings } from "src/context/sharedSettingsContext";
import { adapters } from "src/sync/adapters";
import { VCardMeta } from "src/sync/adapters/adapter";

export const enabled = signal(false);

effect(() => {
  console.log("Settings changed", settings.value?.syncEnabled);
  if (settings.value && settings.value.syncEnabled) {
    enabled.value = settings.value.syncEnabled
  }
})


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
  const setting = settings.value;
  if (setting) {
    return adapters[setting.syncSelected]?.getMetaList();
  }

}

async function getMetaByUID(uid: string): Promise<void> {
  const setting = settings.value;
  if (setting) {
    const adapter = adapters[setting.syncSelected];
    if(adapter) {
      const res = adapter.getMetaByUid(uid);
    }
  }
}

export async function singlePush(file: TFile) {
  const setting = settings.value;
  if (setting) {
    const frontmatter = (await getFrontmatterFromFiles([file]))[0]
    const adapter = adapters[setting.syncSelected];

    if (adapter) {
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
}
