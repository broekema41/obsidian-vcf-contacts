import { VCardForObsidianRecord } from "src/contacts/vcard/index";
import { getApp } from "src/context/sharedAppContext";
import { ContactNameModal } from "src/ui/modals/contactNameModal";
import { createNameSlug } from "src/contacts/vcard/shared/nameUtils";

export async function ensureHasName(
  vCardObject: VCardForObsidianRecord
): Promise<VCardForObsidianRecord> {
  // If we can create a name slug from any available data (N fields, FN, or ORG), we're good
  if (createNameSlug(vCardObject)) return Promise.resolve(vCardObject);

  // Need to prompt for individual's name
  const app = getApp();
  return new Promise((resolve) => {
    console.warn("No name found for record", vCardObject);
    new ContactNameModal(app, vCardObject["FN"], (givenName, familyName) => {
      vCardObject["N.PREFIX"] ??= "";
      vCardObject["N.GN"] = givenName;
      vCardObject["N.MN"] ??= "";
      vCardObject["N.FN"] = familyName;
      vCardObject["N.SUFFIX"] ??= "";
      resolve(vCardObject);
    }).open();
  });
}
