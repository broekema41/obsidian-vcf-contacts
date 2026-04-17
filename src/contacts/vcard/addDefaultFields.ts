import { TFile } from "obsidian";
import { updateFrontMatter } from "src/contacts";
import { getApp } from "src/context/sharedAppContext";
import { getSettings } from "src/context/sharedSettingsContext";

export async function addDefaultFields(file: TFile) {
  const defaultFieldKeys = getSettings().createFieldsKeys
  const { metadataCache } = getApp();

  const frontMatter = metadataCache.getFileCache(file)?.frontmatter;
  if (!frontMatter) {
    throw new Error('No frontmatter found.');
  }
  const record: Record<string, any> = { ...frontMatter };

  let changed = false;

  for (const key of defaultFieldKeys) {
    if (!(key in record)) {
      record[key] = "";
      changed = true;
    }
  }

  if (!changed) return;

  await updateFrontMatter(file, record);

}
