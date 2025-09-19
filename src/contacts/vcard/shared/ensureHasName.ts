import { VCardForObsidianRecord } from "src/contacts/vcard/index";
import { VCardKinds } from "src/contacts/vcard/shared/structuredFields";
import { getApp } from "src/context/sharedAppContext";
import { ContactNameModal, NamingPayload } from "src/ui/modals/contactNameModal";
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
      new ContactNameModal(app, (nameData: NamingPayload) => {
        if(nameData.kind === VCardKinds.Individual) {
          vCardObject["N.PREFIX"] ??= "";
          vCardObject["N.GN"] = nameData.given;
          vCardObject["N.MN"] ??= "";
          vCardObject["N.FN"] = nameData.family;
          vCardObject["N.SUFFIX"] ??= "";
        } else {
          vCardObject["FN"] ??= nameData.fn;
        }
        vCardObject["KIND"] ??= nameData.kind;
        resolve(vCardObject);
      }).open();
    });
  }
}
