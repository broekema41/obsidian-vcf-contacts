import { carddavGenericAdapter } from "src/sync/adapters/carddavGeneric";

export const adapters = {
  None: undefined,
  CardDAV: carddavGenericAdapter()
}
