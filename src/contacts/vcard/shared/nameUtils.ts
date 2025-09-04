import { VCardForObsidianRecord } from "src/contacts/vcard/index";

/**
 * Creates a name slug from vCard records.
 * Builds slug from N components, with FN, NICKNAME, ORG, and UUID as fallbacks.
 * The result is sanitized for use as a filename.
 * @returns Sanitized name string or null if no name can be determined
 */
export function createNameSlug(
  records: VCardForObsidianRecord
): string | undefined {
  let n =
    [
      records["N.PREFIX"],
      records["N.GN"],
      records["N.MN"],
      records["N.FN"],
      records["N.SUFFIX"],
    ]
      .map((part) => part?.trim())
      .filter((part) => part)
      .join(" ") || undefined;

  n ??=
    records["FN"]?.trim() ||
    records["NICKNAME"]?.trim() ||
    records["ORG"]?.trim() ||
    records["UUID"]?.trim() ||
    undefined;

  // Sanitize for filesystem:
  // Replace characters that are problematic in filenames
  // Keep spaces, letters, numbers, and common punctuation including dots
  return n
    ?.replace(/[<>:"\\|?*\x00-\x1F]/g, "") // Remove invalid filename chars
    .replace(/\/+/g, " ") // Replace forward slashes with spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim()
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.{2,}/g, "."); // Replace multiple consecutive dots with single dot
}

/**
 * Checks if vCard has valid N (Name) fields.
 * Valid means at least given name (GN) or family name (FN) is present.
 */
export function hasValidNFields(records: VCardForObsidianRecord): boolean {
  // Check if at least one N field has a non-empty value
  return !!(
    (records["N.GN"] && records["N.GN"].trim()) ||
    (records["N.FN"] && records["N.FN"].trim())
  );
}

/**
 * Determines if a vCard represents an organization rather than an individual.
 * Uses both explicit KIND field and implicit detection (missing N fields).
 * This matches behavior of macOS Contacts.app and other clients.
 */
export function isOrganization(records: VCardForObsidianRecord): boolean {
  // Explicit: KIND field set to 'org'
  const kind = records["KIND"]?.toLowerCase();
  if (kind === "org" || kind === "organization") return true;

  // If explicitly set to individual, respect that
  if (kind === "individual") return false;

  // Implicit: No valid N fields (like macOS Contacts.app)
  // If there's no N data but there is ORG data, treat as organization
  if (!hasValidNFields(records) && records["ORG"]) return true;

  // Default to individual
  return false;
}
