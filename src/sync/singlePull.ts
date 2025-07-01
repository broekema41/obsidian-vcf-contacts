import { getSettings } from "src/context/sharedSettingsContext";
import { adapters } from "src/sync/adapters";

export async function getList() {
  const setting = getSettings();
  return adapters[setting.syncSelected]?.getMetaList();
}

export async function getMetaByUID(uid: string): Promise<void> {
  const setting = getSettings();
  const addapter = adapters[setting.syncSelected];
  if(addapter) {
    const res = addapter.getMetaByUid(uid);
  }

}

export async function singlePull(href: string): Promise<void> {
  const setting = getSettings();
  const addapter = adapters[setting.syncSelected];

  if(addapter) {
      const res = addapter.pull(href);
  }

}
