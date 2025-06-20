import { VCardMeta, VCardRaw } from "src/sync/adapters/adapter";

export interface AdapterInterface {
  /**
   * Push a single vCard (add or update) identified by its UID.
   * @param vcard The vCard object or string to push
   * @returns Promise that resolves on success
   */
  push(vcard: VCardRaw): Promise<void>;

  /**
   * Pull (fetch) a single vCard by UID.
   * @param uid The unique identifier of the vCard to pull
   * @returns Promise resolving to the vCard (or null if not found)
   */
  pull(uid: string): Promise<VCardRaw | undefined>;

  /**
   * Get a list of all vCard metadata (UID, name, lastModified, etc).
   * @returns Promise resolving to an array of vCard metadata objects
   */
  getList(): Promise<VCardMeta[]>;

  /**
   * Check if the remote party is reachable with current settings.
   * @returns Promise resolving to true if connection succeeds, false otherwise
   */
  checkConnectivity(): Promise<boolean>;
}



