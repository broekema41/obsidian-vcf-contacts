export interface VCardRaw {
  uid: string;
  raw: string;         // The raw VCF data
  // Optionally add parsed fields if desired (name, email, etc)
}

export interface VCardMeta {
  uid: string;
  name?: string;
  lastModified: string; // ISO string, always present
  // Optionally more metadata (e.g., email, phone, photo presence, etc)
}
