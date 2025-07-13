import { computed, effect } from "@preact/signals-core";
import { TFile } from "obsidian";
import { Contact, getFrontmatterFromFiles } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { settings } from "src/context/sharedSettingsContext";
import { adapters } from "src/sync/adapters";
import { VCardMeta } from "src/sync/adapters/adapter";
import { cleanUid } from "src/util/vcard";

export const enabled = computed(() => settings.value?.syncEnabled ?? false);

function hasUidMatch(remoteContact:VCardMeta, currentContacts: Contact[]) {
  const uid = remoteContact.uid;
  if(uid === undefined) {
    return false;
  }
  return currentContacts.some(contact =>  cleanUid(contact.data['UID']) === cleanUid(uid));
}

function hasFnMatch(remoteContact: VCardMeta, currentContacts: Contact[]) {
  const fn = remoteContact.fn;
  if(fn === undefined) {
    return false;
  }
  return currentContacts.some(contact => contact.data['FN'] === fn);
}

export async function getUnknownFromRemote(currentContacts: Contact[]): Promise<VCardMeta[]> {
   const fullContactList = await getList();
   if (!fullContactList) {
     return [];
   }
console.log(fullContactList);
   const unknownRemoteContacts = fullContactList.filter((remoteContact) => {
     return !hasUidMatch(remoteContact, currentContacts) && !hasFnMatch(remoteContact, currentContacts);
   })

  console.log(unknownRemoteContacts);
  return unknownRemoteContacts;
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
