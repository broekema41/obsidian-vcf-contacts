import * as yaml from 'js-yaml';
import { TFile } from "obsidian";
import { getApp } from "src/context/sharedAppContext";

export type Contact = {
	data: Record<string, any>;
	file: TFile;
}

export async function getFrontmatterFromFiles(files: TFile[]) {
	const { metadataCache } = getApp();
  const contactsData: Contact[] = [];
  for (const file of files) {
		const frontMatter = metadataCache.getFileCache(file)?.frontmatter
		if (frontMatter?.['N.GN'] && frontMatter?.['N.FN'] ) {
			contactsData.push({
				file,
				data: frontMatter,
			});
		}
  }
  return contactsData;
}

export async function updateFrontMatterValue(file: TFile, key: string, value: string) {
  const app = getApp();
	const content = await app.vault.read(file);

	const match = content.match(/^---\n([\s\S]*?)\n---\n?/);

	let yamlObj: any = {};
	let body = content;

	if (match) {
		yamlObj = yaml.load(match[1]) || {};
		body = content.slice(match[0].length);
	}

	yamlObj[key] = value;

	const newFrontMatter = '---\n' + yaml.dump(yamlObj, { lineWidth: -1 }) + '---\n';
	const newContent = newFrontMatter + body;

	await app.vault.modify(file, newContent);
}
