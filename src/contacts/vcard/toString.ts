import { TFile } from "obsidian";
import { parseKey } from "src/contacts";
import { createGroupNamer, isCustomLabel } from "src/contacts/vcard/shared/propertyGroups";
import { StructuredFields } from "src/contacts/vcard/shared/structuredFields";
import { VCardToStringError, VCardToStringReply } from "src/contacts/vcard/shared/vcard";
import { getApp } from "src/context/sharedAppContext";

function filterNonNull<T>(array: (T | null | undefined)[]): T[] {
	return array.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Renders `EMAIL[School]` as a grouped property with its label:
 *    item1.EMAIL:value
 *    item1.X-ABLabel:School
 * Standard types keep rendering as `EMAIL;TYPE=WORK:value`.
 */
function renderProperty(key: string, type: string | undefined, value: string, nextGroup: () => string): string {
	if (type && isCustomLabel(key, type)) {
		const group = nextGroup();
		return `${group}.${key}:${value}\n${group}.X-ABLabel:${type}`;
	}
	const typeParam = type ? `;TYPE=${type}` : '';
	return `${key}${typeParam}:${value}`;
}

function renderStructuredLines(structuredFields:[string, string][], nextGroup: () => string):string[] {
	const fields =  Object.fromEntries(structuredFields);
	const partialKeys = structuredFields
		.map(([key]) => key.includes('.') ? key.split('.')[0] : null);
	const uniqueKeys = [...new Set(filterNonNull(partialKeys))];

	const structuredLines = uniqueKeys.map((key) => {
		const keyObj = parseKey(key);
		switch (keyObj.key) {
			case 'N': {
				return renderProperty('N', keyObj.type, StructuredFields.N.map(field => fields[key + '.' + field] || "").join(";"), nextGroup);
			}
			case 'ADR': {
				return renderProperty('ADR', keyObj.type, StructuredFields.ADR.map(field => fields[key + '.' + field] || "").join(";"), nextGroup);
			}
			default: {
				return '';
			}
		}
	})

	return structuredLines.filter((line) => line !== '');
}

function renderSingleKey([key, value]:[string, string], nextGroup: () => string):string  {
  const keyObj = parseKey(key);
	return renderProperty(keyObj.key, keyObj.type, value, nextGroup);
}

function generateVCard(file: TFile): string {
  const { metadataCache } = getApp();

  const frontMatter = metadataCache.getFileCache(file)?.frontmatter;
  if (!frontMatter) {
    throw new Error('No frontmatter found.');
  }

  const entries = Object.entries(frontMatter) as Array<[string, string]>;

  const singleLineFields: Array<[string, string]> = [];
  const structuredFields: Array<[string, string]> = [];

  entries.forEach(([key, value]) => {
    const keyObj = parseKey(key);

    if (['ADR', 'N'].includes(keyObj.key)) {
      structuredFields.push([key, value]);
    } else {
      singleLineFields.push([key, value]);
    }
  });

  if (!singleLineFields.some(([key]) => key === 'FN')) {
    singleLineFields.push(['FN', file.basename]);
  }

  const hasFN = singleLineFields.some(([key, _]) => key === 'FN');
  if (!hasFN) {
    singleLineFields.push(['FN', file.basename]);
  }

  const nextGroup = createGroupNamer();
  const structuredLines = renderStructuredLines(structuredFields, nextGroup);
  const singleLines = singleLineFields.map((field) => renderSingleKey(field, nextGroup));
  const lines = structuredLines.concat(singleLines);

  return `BEGIN:VCARD\n${lines.join("\n")}\nEND:VCARD`;

}

export async function toString(contactFiles: TFile[]): Promise<VCardToStringReply> {
  const vCards: string[] = [];
  const vCardsErrors: VCardToStringError[] = [];

  contactFiles.forEach((file) => {
    try {
      const singleVcard = generateVCard(file)
      vCards.push(singleVcard)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      vCardsErrors.push({"status": "error", "file": file.basename, "message": message})
    }
  })

  return Promise.resolve({
    vcards: vCards.join('\n'),
    errors: vCardsErrors
  });

}
