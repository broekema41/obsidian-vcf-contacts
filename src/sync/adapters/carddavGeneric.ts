import { getSettings, onSettingsChange } from "src/context/sharedSettingsContext";
import { VCardMeta, VCardRaw } from "src/sync/adapters/adapter";
import { AdapterInterface } from "src/sync/adapters/adapterInterface";
import { CarddavSettingsInterface } from "src/ui/settings/components/carddavSettings";
import { AppHttpResponse, PlatformHttpClient } from "src/util/platformHttpClient";


export function carddavGenericAdapter(): AdapterInterface {

  let settings = getSettings();
  onSettingsChange(()=> {
    settings = getSettings();
  });

  const getAuthHeader = () => {
    return 'Bearer ' + this.bearerToken;
  }

  const doFetch = async (options: RequestInit): Promise<Response> =>{
    return fetch(settings.CardDAV.addressBookUrl, {
      ...options,
      headers: {
        ...options.headers,
        ['Authorization']: this.getAuthHeader()
      }
    });
  }

  const doPush = async (options: RequestInit, vcard: VCardRaw): Promise<void> => {
    const vcfUrl = settings.CardDAV.addressBookUrl + `${vcard.uid}.vcf`;
    const res = await fetch(vcfUrl, {
      method: 'PUT',
      body: vcard.raw,
      headers: {
        ...options.headers,
        ['Authorization']: this.getAuthHeader(),
        ['Content-Type']: 'text/vcard; charset=utf-8'
      }
    });
    if (!res.ok) throw new Error(`Push failed: ${res.statusText}`);
  }

  const checkConnectivity = async (settings: CarddavSettingsInterface): Promise<AppHttpResponse> =>  {
    const headers = { Authorization : ''};
    if (settings.authKey) {
      headers.Authorization = `Bearer ${settings.authKey}`;
    } else {
      headers.Authorization = 'Basic ' + btoa(settings.username + ":" + settings.password);
    }
    return await PlatformHttpClient.request({
        url: settings.addressBookUrl,
        method: 'OPTIONS',
        headers,
      });
  }

  const getList = async (): Promise<VCardMeta[]> => {
    return Promise.resolve([]);
  }

  const pull = async (uid: string): Promise<VCardRaw | undefined> => {
    return Promise.resolve(undefined);
  }

  const push = async (vcard: VCardRaw): Promise<void> => {
    return Promise.resolve(undefined);
  }

  return {
    checkConnectivity,
    getList,
    pull,
    push,
  };

}

