import { VCardForObsidianRecord } from "src/contacts/vcard/index";
import { getApp } from "src/context/sharedAppContext";
import { ContactNameModal } from "src/ui/modals/contactNameModal";
import { createNameSlug } from "src/util/nameUtils";

export async function ensureHasName(
  vCardObject: VCardForObsidianRecord
): Promise<VCardForObsidianRecord> {
  try {
    // if we can create a file name then we meet the minimum requirements
    createNameSlug(vCardObject)
    return Promise.resolve(vCardObject);
  } catch (error) {
    // Need to prompt for some form of name information.
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
}
