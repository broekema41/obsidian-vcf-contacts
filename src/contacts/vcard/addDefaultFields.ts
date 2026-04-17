import { TFile } from "obsidian";
import { getApp } from "src/context/sharedAppContext";
import { getSettings } from "src/context/sharedSettingsContext";

import { VCardForObsidianRecord } from "./shared/vcard";

export async function addDefaultFields(file: TFile):Promise<VCardForObsidianRecord> {
  const defaultFieldKeys = getSettings().createFieldsKeys
  const { metadataCache } = getApp();

  const frontMatter = metadataCache.getFileCache(file)?.frontmatter;
  if (!frontMatter) {
    throw new Error('No frontmatter found.');
  }
  const record: Record<string, any> = { ...frontMatter };
  for (const key of defaultFieldKeys) {
    if (!(key in record)) {
      record[key] = "";
    }
  }

  return  record;

}
