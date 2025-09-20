import { deleteOnRemote, enabled, getUnknownFromRemote, pullFromRemote, pushToRemote} from "src/sync/sync";

export const sync = {
  getUnknownFromRemote,
  pullFromRemote,
  pushToRemote,
  deleteOnRemote,
  enabled,
};
