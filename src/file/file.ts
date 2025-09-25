import {App, normalizePath, Notice, Platform, TFile, TFolder, Vault, Workspace} from "obsidian";
import { getFrontmatterFromFiles } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import { RunType } from "src/insights/insight.d";
import { insightService } from "src/insights/insightService";
import { FileExistsModal } from "src/ui/modals/fileExistsModal";
import { createNameSlug } from "src/util/nameUtils";


export async function openFile(file: TFile, workspace: Workspace) {
  const leaf = workspace.getLeaf()
  await leaf.openFile(file, { active: true });
}

export function findContactFiles(contactsFolder: TFolder) {
  const contactFiles: TFile[] = [];
  Vault.recurseChildren(contactsFolder, async (contactNote) => {
    if (contactNote instanceof TFile) {
      contactFiles.push(contactNote);
    }
  });
  return contactFiles;
}

function openCreatedFile(app: App, filePath: string) {
	const file = app.vault.getAbstractFileByPath(filePath);
	if (file instanceof TFile) {
		openFile(file, app.workspace);
	}
}

async function handleFileCreation(app: App, filePath: string, content: string) {
	const fileExists = await app.vault.adapter.exists(filePath);

	if (fileExists) {
		new FileExistsModal(app, filePath, async (action: "replace" | "skip") => {
			if (action === "skip") {
				new Notice("File creation skipped.");
				return;
			}

			if (action === "replace") {
				await app.vault.adapter.write(filePath, content);
				openCreatedFile(app, filePath);
				new Notice(`File overwritten.`);
			}
		}).open();
	} else {
		const createdFile = await app.vault.create(filePath, content);
    await new Promise(r => setTimeout(r, 50));
    const contact= await getFrontmatterFromFiles([createdFile])
    await insightService.process(contact, RunType.IMMEDIATELY);
		openFile(createdFile, app.workspace);
	}
}

export function createContactFile(
	app: App,
	folderPath: string,
	content: string,
	filename: string
) {
	const folder = app.vault.getAbstractFileByPath(folderPath !== '' ? folderPath : '/') ;
	if (!folder) {
		new Notice(`Can not find path: '${folderPath}'. Please update "Contacts" plugin settings`);
		return;
	}
	const activeFile = app.workspace.getActiveFile();
	const parentFolder = activeFile?.parent; // Get the parent folder if it's a file

	if (parentFolder?.path?.contains(folderPath)) {
		const filePath = normalizePath(fileJoin(parentFolder.path, filename));
		handleFileCreation(app, filePath, content);
	} else {
		const filePath = normalizePath(fileJoin(folderPath, filename));
		handleFileCreation(app, filePath, content);
	}
}

export function fileId(file: TFile): string {
	let hash = 0;
	for (let i = 0; i < file.path.length; i++) {
		hash = (hash << 5) - hash + file.path.charCodeAt(i);
		hash |= 0; // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(); // Ensure it's positive
}

export function fileJoin(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");
}

export async function openFilePicker(type: string): Promise<string | Blob> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type;
    input.style.display = "none";

    input.addEventListener("change", async () => {
      if (input?.files && input.files.length > 0) {
        const file = input.files[0];

        const isImage = type === "image/*" || type.startsWith("image/");
        if (isImage) {
          resolve(file); // Return the File for image use
        } else {
          try {
            // Prefer raw bytes so we can detect encoding
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const encoding = detectVCardEncoding(bytes);
            const decoder = new TextDecoder(encoding as any, { fatal: false });
            let text = decoder.decode(bytes);

            // Optionally strip leading BOM char if present after decode
            if (text.charCodeAt(0) === 0xfeff) {
              text = text.slice(1);
            }

            resolve(text);
          } catch (e) {
            // Fallback to UTF-8 text if anything goes wrong
            const reader = new FileReader();
            reader.onload = function (event) {
              const rawData = event?.target?.result || "";
              if (typeof rawData === "string") {
                resolve(rawData);
              } else {
                resolve(new TextDecoder("utf-8").decode(rawData as ArrayBuffer));
              }
            };
            reader.readAsText(file, "UTF-8");
          }
        }
      } else {
        resolve("");
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}

/**
 * Best-effort encoding detection for vCard files.
 * Strategy:
 * 1) BOM
 * 2) Valid UTF-8 heuristic
 * 3) CHARSET=... token in vCard (v2.1/3.0)
 * 4) Fallback to windows-1252
 */
function detectVCardEncoding(bytes: Uint8Array): string {
  const bom = detectBom(bytes);
  if (bom) return bom;

  if (isLikelyUtf8(bytes)) return "utf-8";

  const charset = detectVCardCharsetToken(bytes);
  if (charset) return normalizeEncodingLabel(charset);

  // Common legacy default for Western vCards
  return "windows-1252";
}

function detectBom(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8";
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    // Could be UTF-16LE or UTF-32LE if next two are 0x00 0x00
    if (bytes.length >= 4 && bytes[2] === 0x00 && bytes[3] === 0x00) return "utf-32le";
    return "utf-16le";
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return "utf-16be";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0xfe &&
    bytes[3] === 0xff
  ) {
    return "utf-32be";
  }
  return null;
}

// Simple UTF-8 validator (not perfect, but good heuristic)
/*
  What this does:
  - Scans the byte array left-to-right and checks if it could be valid UTF‑8.

  How it decides:
  1) ASCII fast-path:
     - Bytes 0x00–0x7F are plain ASCII and always valid in UTF‑8, so they pass.

  2) Lead byte classification:
     - If a byte is not ASCII, it must be the lead byte of a multi-byte UTF‑8 sequence.
     - The code uses the lead-byte ranges to decide how many continuation bytes to expect:
         0xC2–0xDF → expect 1 continuation byte (2-byte sequence)
         0xE0–0xEF → expect 2 continuation bytes (3-byte sequence)
         0xF0–0xF4 → expect 3 continuation bytes (4-byte sequence)
       Any other non-ASCII lead value is rejected immediately.

     Why start at 0xC2 (and not 0xC0)?
     - 0xC0 and 0xC1 would allow overlong encodings of ASCII, which UTF‑8 forbids. Excluding them filters those out.

  3) Continuation bytes check:
     - For the expected number of continuation bytes, each must exist and match the bit pattern 10xxxxxx (i.e., 0x80–0xBF).
     - If a required continuation is missing or malformed, the function returns false.

  4) Success condition:
     - If the entire array is consumed following the above rules, it returns true.

  Limitations (why it's a heuristic, not a full validator):
  - It doesn't check all UTF‑8 edge constraints (e.g., the tighter rules for E0, ED, F0, F4 sequences,
    surrogate ranges, or every possible overlong form beyond excluding 0xC0–0xC1).
  - It’s designed to quickly distinguish “likely UTF‑8” from legacy single-byte encodings; rare false positives are possible,
    but it works well for practical pre-detection before choosing a decoder.
*/
function isLikelyUtf8(bytes: Uint8Array): boolean {
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b <= 0x7f) continue; // ASCII

    let n = 0;
    if (b >= 0xc2 && b <= 0xdf) n = 1; // 2-byte
    else if (b >= 0xe0 && b <= 0xef) n = 2; // 3-byte
    else if (b >= 0xf0 && b <= 0xf4) n = 3; // 4-byte
    else return false;

    for (let j = 0; j < n; j++) {
      if (i >= bytes.length) return false;
      const c = bytes[i++];
      if ((c & 0xc0) !== 0x80) return false;
    }
  }
  return true;
}

/**
 * Try to locate a vCard CHARSET=... token using only ASCII matching.
 * Example: N;CHARSET=ISO-8859-1:...
 */
function detectVCardCharsetToken(bytes: Uint8Array): string | null {
  // Build ASCII-only string to safely search tokens without decoding
  let ascii = "";
  const limit = Math.min(bytes.length, 64 * 1024); // scan up to 64KB
  for (let i = 0; i < limit; i++) {
    const b = bytes[i];
    ascii += b < 0x80 ? String.fromCharCode(b) : ".";
  }

  const idx = ascii.toUpperCase().indexOf("CHARSET=");
  if (idx === -1) return null;

  // Extract token until a separator (; , : \n \r)
  const start = idx + "CHARSET=".length;
  let end = start;
  while (
    end < ascii.length &&
    ![";", ",", ":", "\n", "\r"].includes(ascii[end])
  ) {
    end++;
  }

  const raw = ascii.slice(start, end).trim();
  if (!raw) return null;
  return raw;
}

/**
 * Map common charset tokens to WHATWG/TextDecoder labels.
 */
function normalizeEncodingLabel(label: string): string {
  const lower = label.toLowerCase();

  // Common synonyms
  if (lower === "utf8" || lower === "utf-8") return "utf-8";
  if (lower === "utf-16" || lower === "utf16") return "utf-16le"; // ambiguous; most files are LE on Windows
  if (lower === "utf-16le" || lower === "utf16le") return "utf-16le";
  if (lower === "utf-16be" || lower === "utf16be") return "utf-16be";

  if (lower === "latin1" || lower === "iso8859-1" || lower === "iso_8859-1" || lower === "iso-8859-1")
    return "iso-8859-1";

  if (lower === "cp1252" || lower === "windows-1252" || lower === "windows1252")
    return "windows-1252";

  if (lower === "shift-jis" || lower === "shift_jis" || lower === "sjis")
    return "shift_jis";

  if (lower === "gbk") return "gbk";
  if (lower === "gb2312") return "gb2312";
  if (lower === "big5") return "big5";
  if (lower === "euc-kr" || lower === "euc_kr") return "euc-kr";
  if (lower === "windows-1251" || lower === "cp1251") return "windows-1251";

  // Let TextDecoder try the provided label if it's valid
  return lower;
}

export function saveVcardFilePicker(data: string, obsidianFile?: TFile ) {
  try {

    const file = new Blob([data], { type: "text/vcard" });
    const filename = obsidianFile ? obsidianFile.basename.replace(/ /g, '-') + '.vcf' : "shared-contacts.vcf";
    const fileObject = new File([file], filename, { type: "text/vcard" });

    /**
     * Warning we are hooking into obsidian implementation (capacitor)
     * This dependency can change at any point but there is no alternative
     * found that can actually share without extra user click on IOS and Android
    **/
    // @ts-ignore
    if(Platform.isMobileApp && window.Capacitor && typeof window.Capacitor.Plugins.Filesystem.open === 'function') {
      (async () => {
        try {
          // @ts-ignore
          await window.Capacitor.Plugins.Filesystem.writeFile({
            path: filename,
            data,
            directory: 'DOCUMENTS',
            encoding: 'utf8'
          });
          if(Platform.isAndroidApp) {
            new Notice(`Saved to /Documents on device:\n${filename}\nOpen the Files app to share with other applications`);
          } else {
            new Notice(`\`Saved to your device's Files app under this app:\n${filename}\nOpen the Files app to share with other applications`);
          }
        } catch (e) {
          console.log(e);
        }
      })();

    } else {

      // desktopApp
      const element = document.createElement("a");
      element.href = URL.createObjectURL(fileObject);
      element.download = filename;
      element.click();
    }

  } catch (err) {
    console.log("Failed to share or save VCard", err);
  }
}

export function createFileName(records: Record<string, string>) {
	const nameSlug = createNameSlug(records);

	if (!nameSlug) {
		console.error('No name found for record', records);
		throw new Error('No name found for record');
	}

	return nameSlug + '.md';
}


export function isFileInFolder(file: TFile) {
  const settings = getSettings()
  return file.path.startsWith(settings.contactsFolder);
}
