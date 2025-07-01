import { TFile } from "obsidian";
import { parseKey } from "src/contacts";
import { StructuredFields } from "src/contacts/vcard/shared/structuredFields";
import { VCardToStringError, VCardToStringReply } from "src/contacts/vcard/shared/vcard";
import { getApp } from "src/context/sharedAppContext";

function filterNonNull<T>(array: (T | null | undefined)[]): T[] {
	return array.filter((item): item is T => item !== null && item !== undefined);
}

function renderStructuredLines(structuredFields:[string, string][]):string[] {
	const fields =  Object.fromEntries(structuredFields);
	const partialKeys = structuredFields
		.map(([key]) => key.includes('.') ? key.split('.')[0] : null);
	const uniqueKeys = [...new Set(filterNonNull(partialKeys))];

	const structuredLines = uniqueKeys.map((key) => {
		const keyObj = parseKey(key);
		const type = keyObj.type ? `;TYPE=${keyObj.type}` : '';
		switch (keyObj.key) {
			case 'N': {
				return `N${type}:${StructuredFields.N.map(field => fields[key + '.' + field] || "").join(";")}`;
			}
			case 'ADR': {
				return `ADR${type}:${StructuredFields.ADR.map(field => fields[key + '.' + field] || "").join(";")}`;
			}
			default: {
				return '';
			}
		}
	})

	return structuredLines.filter((line) => line !== '');
}

function renderSingleKey([key, value]:[string, string]):string  {
	const keyObj = parseKey(key);
	const type = keyObj.type ? `;TYPE=${keyObj.type}` : '';
	return `${keyObj.key}${type}:${value}`;
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

  const structuredLines = renderStructuredLines(structuredFields);
  const singleLines = singleLineFields.map(renderSingleKey);
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
      vCardsErrors.push({"status": "error", "file": file.basename, "message": err.message})
    }
  })

  return Promise.resolve({
    vcards: vCards.join('\n'),
    errors: vCardsErrors
  });

}
