import { App } from "obsidian";
import * as React from "react";
import { setSettings } from "src/context/sharedSettingsContext";
import ContactsPlugin from "src/main";
import { SyncSelected } from "src/settings/settings";
import { carddavGenericAdapter } from "src/sync/adapters/carddavGeneric";
import CarddavSettings from "src/ui/settings/components/carddavSettings";


interface SynchronizationSettingsProps {
  plugin: ContactsPlugin;
  app: App;
}

const initCardavSettings = {
  addressBookUrl: "",
  username: "",
  password: "",
  authKey: ""
};

export function SynchronizationSettings({plugin, app}: SynchronizationSettingsProps) {

  const [warning, setWarning] = React.useState('');
  const [syncEnabled, setSyncEnabled] = React.useState<boolean>(plugin.settings.syncEnabled);
  const [syncSelected, setSyncSelected] = React.useState<SyncSelected>(plugin.settings.syncSelected);
  const [carddavSettings, setCarddavSettings] = React.useState({
    ...initCardavSettings,
    addressBookUrl: plugin.settings.CardDAV.addressBookUrl
  });

  const enableSync = async () => {
    if (syncSelected !== 'CardDAV') {
      setWarning('Kindly select a synchronization method and provide the required connection information. Thank you!');
      return;
    }

    try {
      const result = await carddavGenericAdapter().checkConnectivity(carddavSettings);
      if (result.errorMessage) {
        setWarning(`failed to enable connection! ${result.errorMessage}. Please check your connection settings.`);
        return;
      }
      if (!(result.status >= 200 && result.status < 300)) {
        setWarning('failed to enable connection! unknown error. Please check your connection settings.');
        return;
      }

      plugin.settings.syncEnabled = true;
      plugin.settings.CardDAV = {
        addressBookUrl: carddavSettings.addressBookUrl,
        syncInterval: 900,
        authType: carddavSettings.authKey ? 'apikey' : 'basic',
        authKey: carddavSettings.authKey ? carddavSettings.authKey : btoa(`${carddavSettings.username}:${carddavSettings.password}`)
      };
      setCarddavSettings({
        ...initCardavSettings,
        addressBookUrl: plugin.settings.CardDAV.addressBookUrl
      });
      setSyncEnabled(true);
      setWarning('');
      await plugin.saveSettings();
      setSettings(plugin.settings);
    } catch (err: any) {
      setWarning(`failed to enable connection! ${err?.message || err || 'Unknown error'}.`);
    }
  };

  const disableSync = () => {
    plugin.settings.syncEnabled = false;
    plugin.saveSettings();
    setSyncEnabled(false);
    setSyncSelected('None');
    setSettings(plugin.settings);
  }

  // React.useEffect(() => {
  //   console.log(carddavSettings);
  //
  // },[carddavSettings]);

  React.useEffect(() => {
    plugin.settings.syncSelected = syncSelected;
    plugin.saveSettings();
  }, [syncSelected]);

  return (
    <>
      <div className="setting-item setting-item-heading">
        <div className="setting-item-info">
          <div className="setting-item-name">Synchronization settings</div>
          <div className="setting-item-description"></div>
        </div>
        <div className="setting-item-control"></div>
      </div>
      <div className="setting-item js-keep">
        <div className="setting-item-info">
          <div className="setting-item-name">Synchronization</div>
          <div className="setting-item-description">
            {syncEnabled ? <div className="mod-success">CardDAV sync Enabled</div> : ''}
            <div className="mod-warning">{warning}</div>
          </div>
        </div>
        <div className="setting-item-control">
          {syncEnabled ?
            <button className="mod-destructive" onClick={disableSync}>Disable</button>
            :
            <button className="mod-cta" onClick={enableSync}>Enable</button>
          }
        </div>
      </div>
      <div className="setting-item js-keep">
        <div className="setting-item-info">
          <div className="setting-item-name">Sync method</div>
          <div className="setting-item-description">Choose how you want to synchronize your contacts.</div>
        </div>
        <div className="setting-item-control">
          <select
            className="dropdown"
            value={syncSelected}
            onChange={e => {
              disableSync();
              setSyncSelected(e.target.value as SyncSelected);
            }}>
            <option value="None">No synchronization</option>
            <option value="CardDAV">CardDAV address book</option>
          </select>
        </div>
      </div>

      {syncSelected === "CardDAV" && (
        <CarddavSettings
          carddavSettings={carddavSettings}
          setCarddavSettings={setCarddavSettings}
        />
      )}
    </>
  )

}
