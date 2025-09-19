export const StructuredFields = {
  N: ["FN", "GN", "MN", "PREFIX", "SUFFIX"],
  ADR: ["PO", "EXT", "STREET", "LOCALITY", "REGION", "POSTAL", "COUNTRY"]
} as const;

export const VCardKinds = {
  Individual: "individual",
  Organisation: "org",
  Group: "group",
  Location: "location",
} as const;
