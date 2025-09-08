import { Contact } from "src/contacts";
import { VCardForObsidianRecord, VCardKind } from "src/contacts/vcard/index";
import { VCardKinds } from "src/contacts/vcard/shared/structuredFields";

/**
 * Doing our best for the user with minimal code to
 * clean up the filename.
 * @param input
 */
function sanitizeFileName(input: string) {
  const illegalRe = /[\/\?<>\\:\*\|"]/g;
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  const windowsTrailingRe = /[\. ]+$/;
  const multipleSpacesRe = /\s+/g;
  return input
    .replace(illegalRe, ' ')
    .replace(controlRe, ' ')
    .replace(reservedRe, ' ')
    .replace(windowsReservedRe, ' ')
    .replace(windowsTrailingRe, ' ')
    .replace(multipleSpacesRe, " ")
    .trim();
}


/**
 * Creates a name slug from vCard records. FN is a mandatory
 * field in the spec so we fall back to that.
 */
export function createNameSlug(
  record: VCardForObsidianRecord
): string  {
  let fileName: string | undefined = undefined;
  if(isKind(record, VCardKinds.Individual)) {
    fileName = [
      record["N.PREFIX"],
      record["N.GN"],
      record["N.MN"],
      record["N.FN"],
      record["N.SUFFIX"],
    ]
      .map((part) => part?.trim())
      .filter((part) => part)
      .join(" ") || undefined;
  }

  if(!fileName && record["FN"]) {
    fileName = record["FN"];
  }

  if (!fileName) {
    throw new Error(`Failed to update, create file name due to missing FN property"`);
  }

  return sanitizeFileName(fileName)
}

export function getSortName (contact:VCardForObsidianRecord): string {
  if(isKind(contact, VCardKinds.Individual)) {
    const name = contact["N.GN"] + contact["N.FN"];
    if (!name) {
      return contact["FN"]
    }
    return name;
  }
  return contact["FN"]

}


export function uiSafeString (input: unknown): string | undefined {
  if (input === null || input === undefined){
    return undefined;
  }

  if (typeof input === 'string') {
    return input.trim();
  } else if (typeof input === 'number' || input instanceof Date || typeof input === 'boolean') {
    return input.toString();
  } else {
    return undefined;
  }
}

export function getUiName(contact:VCardForObsidianRecord): string {
  if (isKind(contact, VCardKinds.Individual)) {
    const myName = [
      contact["N.PREFIX"],
      contact["N.GN"],
      contact["N.MN"],
      contact["N.FN"],
      contact["N.SUFFIX"]
    ]
      .map(uiSafeString)
      .filter((value) => value !== undefined)
      .join(' ')

    if(myName.length > 0) {
      return myName;
    }
  }
  return uiSafeString(contact["FN"]) || '';

}


export function isKind(record: VCardForObsidianRecord, kind: VCardKind): boolean {
  const myKind = record["KIND"] || VCardKinds.Individual
  return myKind === kind;
}
