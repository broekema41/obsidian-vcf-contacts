import { computed } from "@preact/signals-core";
import { Notice } from "obsidian";
import { Contact, getFrontmatterFromFiles, updateFrontMatterValue } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { settings } from "src/context/sharedSettingsContext";
import { adapters } from "src/sync/adapters";
import { VCardMeta, VCardRaw } from "src/sync/adapters/adapter";
import { AppHttpResponse } from "src/util/platformHttpClient";
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
  console.log('fullContactList', fullContactList);
  if (fullContactList && "errorMessage" in fullContactList) {
    new Notice(fullContactList.errorMessage);
    return [];
  }

  if (!fullContactList) {
    return [];
  }

  const unknownRemoteContacts = fullContactList.filter((remoteContact) => {
    return !hasUidMatch(remoteContact, currentContacts) && !hasFnMatch(remoteContact, currentContacts);
  })

  console.log(unknownRemoteContacts);
  return unknownRemoteContacts;
}

export async function getRawVcardFromRemote(href: string) {
  const setting = settings.value;
  if (setting) {
    const adapter = adapters[setting.syncSelected];
    if(adapter) {
      return adapter.pull(href);
    }
  }
  return undefined;
}

export async function deleteOnRemote(contact: Contact) {
  const setting = settings.value;
  if (setting) {
    const meta = await getMetaByUID(contact.data['UID'])
    const adapter = adapters[setting.syncSelected];
    if (adapter && meta) {
      const res =  await adapter.delete(meta.href);
      if(res.status && (res.status < 200 || res.status > 300)) {
        new Notice(res.data);
        return undefined;
      }
    }
    return undefined;
  }
}

export async function pushToRemote(contact: Contact) {
  const setting = settings.value;
  if (setting) {
    const frontmatter = (await getFrontmatterFromFiles([contact.file]))[0]
    const adapter = adapters[setting.syncSelected];
    if (adapter) {
      const result = await vcard.toString([contact.file]);
      if (result.errors.length > 0) {
        return;
      }
      const res = await adapter.push({
        uid: frontmatter.data['UID'].split(':').pop(),
        raw: result.vcards
      })


      if (res && "errorMessage" in res && res.errorMessage) {
        new Notice(res.errorMessage);
        return;
      }

      if(res.status && (res.status < 200 || res.status > 300)) {
        new Notice(res.data);
        return;
      }
    }
  }
}

export async function pullFromRemote(href: string): Promise<VCardRaw | undefined> {
  const remoteRaw = await getRawVcardFromRemote(href);

  if (remoteRaw && "errorMessage" in remoteRaw) {
    new Notice(remoteRaw.errorMessage);
    return;
  }
  return remoteRaw;
}


export async function updateFromRemote(contact: Contact) {
  const meta = await getMetaByUID(contact.data['UID'])

  if (meta) {
    const remoteRaw = await getRawVcardFromRemote(meta.href);

    if (remoteRaw && "errorMessage" in remoteRaw) {
      new Notice(remoteRaw.errorMessage);
      return;
    }

    if (remoteRaw) {
      const remoteVcf = await vcard.parse(remoteRaw.raw).next();

      if(remoteVcf?.value?.[1] && typeof remoteVcf?.value?.[1] !== 'string') {
        for (const [key, value] of Object.entries(remoteVcf.value?.[1])) {

          if (key === 'UID') {
            break;
          }

          const localValue = contact.data[key];

          if (key === 'PHOTO' ) {
            if(!localValue || localValue=== '') {
              await updateFrontMatterValue(contact.file, key, value);
            }
            break;
          }

          if (!localValue || localValue === '') {
            await updateFrontMatterValue(contact.file, key, value);
            break;
          }

          if(value.length !== 0 && localValue !== value) {
            await updateFrontMatterValue(contact.file, key, value);
          }
        }
      }
    }
  }
}

async function getList() {
  const setting = settings.value;
  if (setting) {
    return adapters[setting.syncSelected]?.getMetaList();
  }
}

async function getMetaByUID(uid: string): Promise<VCardMeta | undefined> {
  const setting = settings.value;
  if (setting) {
    const adapter = adapters[setting.syncSelected];
    if(adapter) {
      const res:VCardMeta | AppHttpResponse | undefined = await adapter.getMetaByUid(uid);
      if (res && "errorMessage" in res && res.errorMessage) {
        new Notice(res.errorMessage);
        return undefined;
      }
      return res as VCardMeta | undefined;
    }
  }
}
