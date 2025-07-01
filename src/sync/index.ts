import { getList, getMetaByUID, singlePull, } from "src/sync/singlePull";
import { singlePush } from "src/sync/singlePush";

export const sync = {
  singlePull,
  singlePush,
  getList,
  do: async () => {
    const list = await getList();
    if (list && list[0]) {
      getMetaByUID('019730a76c153-4458-a488-2f227fab60e7')
      // singlePull(list[0])
    }
  },
  running: {},
  enabled:{},
};
