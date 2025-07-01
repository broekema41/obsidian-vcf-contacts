export interface VCardRaw {
  uid: string | undefined;
  raw: string; // The raw VCF data
}

export interface VCardMeta {
  href: string;
  etag: string;
  lastModified: Date;
  uid: string | undefined;
  fn: string | undefined;
}
