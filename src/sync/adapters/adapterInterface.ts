import { VCardMeta, VCardRaw } from "src/sync/adapters/adapter";
import { CarddavSettingsInterface } from "src/ui/settings/components/carddavSettings";
import { AppHttpResponse } from "src/util/platformHttpClient";

export interface AdapterInterface {
  /**
   * Push a single vCard (add or update) identified by its UID.
   * @param vcard The vCard object or string to push
   * @returns Promise that resolves on success
   */
  push(vcard: VCardRaw): Promise<AppHttpResponse>;

  /**
   * delete a single vCard identified by its UID.
   * @param href The unique path of the vCard to pull
   * @returns Promise that resolves on success
   */
  delete(href: string): Promise<AppHttpResponse>;

  /**
   * Pull (fetch) a single vCard by UID.
   * @param href The unique path of the vCard to pull
   * @returns Promise that resolves on success
   */
  pull(href: string): Promise<VCardRaw | AppHttpResponse | undefined>;

  /**
   * Get a list of all vCard metadata (UID, name, lastModified, etc).
   * @returns Promise resolving to an array of vCard metadata objects
   */
  getMetaList(): Promise<VCardMeta[] | AppHttpResponse>;

  /**
   * Get a vCard metadata (UID, name, lastModified, etc).
   * @returns Promise resolving to an array of vCard metadata objects
   */
  getMetaByUid(uid: string): Promise<VCardMeta | AppHttpResponse | undefined>;

  /**
   * Check if the remote party is reachable with current settings.
   * @returns Promise resolving to true if connection succeeds, false otherwise
   */
  checkConnectivity(settings: CarddavSettingsInterface): Promise<AppHttpResponse>
}



