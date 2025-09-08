import { VCardKind } from "src/contacts/vcard/shared/vcard";

export const StructuredFields = {
  N: ["FN", "GN", "MN", "PREFIX", "SUFFIX"],
  ADR: ["PO", "EXT", "STREET", "LOCALITY", "REGION", "POSTAL", "COUNTRY"]
} as const;

export const VCardKinds = {
  Individual: "individual" as VCardKind,
  Org: "org" as VCardKind,
  Group: "group" as VCardKind,
} as const;
