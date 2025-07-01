import { TFile } from "obsidian";
import { getFrontmatterFromFiles } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { getSettings } from "src/context/sharedSettingsContext";
import { adapters } from "src/sync/adapters";

export async function singlePush(file: TFile) {
  const setting = getSettings();
  const frontmatter = (await getFrontmatterFromFiles([file]))[0]
  const addapter = adapters[setting.syncSelected];

  if(addapter) {
    const result = await vcard.toString([file]);
    if (result.errors.length > 0) {
      return;
    }
    await addapter.push({
      uid: frontmatter.data['UID'].split(':').pop(),
      raw: result.vcards
    })
  }


}
