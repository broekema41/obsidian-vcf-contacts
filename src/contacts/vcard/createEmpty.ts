import { ensureHasName } from "src/contacts/vcard/shared/ensureHasName";
import { getSettings } from "src/context/sharedSettingsContext";
import { generateUUID } from "src/util/vcard";

export async function createEmpty() {
  const fieldKeys = getSettings().createFieldsKeys

  const baseObject: Record<string, any> = {
    "FN": "",
    "N.GN": "",
    "N.FN": "",
    "KIND": "",
    "VERSION": "4.0",
    "UID": `urn:uuid:${generateUUID()}`
  };

  const vCardObject = {...baseObject}

  for (const key of fieldKeys) {
    vCardObject[key] = "";
  }

  return await ensureHasName(vCardObject);
}
