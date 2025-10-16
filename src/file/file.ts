import {App, normalizePath, Notice, Platform, TFile, TFolder, Vault, Workspace} from "obsidian";
import {getFrontmatterFromFiles} from "src/contacts";
import {getSettings} from "src/context/sharedSettingsContext";
import {RunType} from "src/insights/insight.d";
import {insightService} from "src/insights/insightService";
import {FileExistsModal} from "src/ui/modals/fileExistsModal";
import {createNameSlug} from "src/util/nameUtils";

import {Deferred} from "../util/deferred";
import {detectVCardEncoding} from "./encodingDetection";


export async function openFile(file: TFile, workspace: Workspace) {
  const leaf = workspace.getLeaf()
  await leaf.openFile(file, {active: true});
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
    await insightService.process(RunType.IMMEDIATELY);
    openFile(createdFile, app.workspace);
  }
}

export function createContactFile(
  app: App,
  folderPath: string,
  content: string,
  filename: string
) {
  const folder = app.vault.getAbstractFileByPath(folderPath !== '' ? folderPath : '/');
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
  const deferred = new Deferred<string | Blob>();
  const input = document.createElement("input");
  input.type = "file";
  input.accept = type;
  input.style.display = "none";
  input.addEventListener("change", async () => {
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];

      const isImage = type === "image/*" || type.startsWith("image/");
      if (isImage) {
        deferred.resolve(file); // Return the File for image use
      } else {
        const parsed = await parseTextFile(file);
        deferred.resolve(parsed);
      }
    } else {
      deferred.resolve("");
    }
  });

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);

  return deferred.promise;
}

export async function parseTextFile(file: Blob): Promise<string> {
  try {
    // Prefer raw bytes so we can detect encoding
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const encoding = detectVCardEncoding(bytes);
    const decoder = new TextDecoder(encoding as any, {fatal: false});
    let text = decoder.decode(bytes);

    // Optionally strip leading BOM char if present after decoding
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }

    return text;
  } catch (e) {
    // Fallback to UTF-8 text if anything goes wrong
    const reader = new FileReader();
    const deferred = new Deferred<string>();

    reader.onload = function (event) {
      const rawData = event?.target?.result || "";
      if (typeof rawData === "string") {
        deferred.resolve(rawData);
      } else {
        deferred.resolve(new TextDecoder("utf-8").decode(rawData as ArrayBuffer));
      }
    };

    reader.readAsText(file, "UTF-8");

    return await deferred.promise;
  }
}

export function saveVcardFilePicker(data: string, obsidianFile?: TFile) {
  try {

    const file = new Blob([data], {type: "text/vcard"});
    const filename = obsidianFile ? obsidianFile.basename.replace(/ /g, '-') + '.vcf' : "shared-contacts.vcf";
    const fileObject = new File([file], filename, {type: "text/vcard"});

    /**
     * Warning we are hooking into obsidian implementation (capacitor)
     * This dependency can change at any point but there is no alternative
     * found that can actually share without extra user click on IOS and Android
     **/
    // @ts-ignore
    if (Platform.isMobileApp && window.Capacitor && typeof window.Capacitor.Plugins.Filesystem.open === 'function') {
      (async () => {
        try {
          // @ts-ignore
          await window.Capacitor.Plugins.Filesystem.writeFile({
            path: filename,
            data,
            directory: 'DOCUMENTS',
            encoding: 'utf8'
          });
          if (Platform.isAndroidApp) {
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
