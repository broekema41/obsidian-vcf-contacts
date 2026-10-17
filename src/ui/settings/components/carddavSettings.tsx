import * as React from "react";
import { AuthType } from "src/settings/settings";

export interface CarddavSettingsInterface {
  addressBookUrl: string;
  username: string;
  password: string;
  apiKey: string;
}

interface CarddavSettingsProps {
  carddavSettings: CarddavSettingsInterface;
  setCarddavSettings: (settings: CarddavSettingsInterface) => void;
  /** Auth type of the saved credentials, undefined when nothing is saved. */
  savedAuthType: AuthType | undefined;
  /** Fields are read-only while sync is enabled. */
  locked: boolean;
}

const KEEP_SAVED = 'Saved, leave empty to keep';

export default function CarddavSettings({ carddavSettings, setCarddavSettings, savedAuthType, locked }: CarddavSettingsProps) {

   return (
    <>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Address Book URL</div>
          <div className="setting-item-description">
            URL of your CardDAV address book.
          </div>
        </div>
        <div className="setting-item-control">
          <input
            className="textfield"
            type="text"
            placeholder="https://example.com/carddav"
            value={carddavSettings.addressBookUrl}
            disabled={locked}
            onChange={e => setCarddavSettings({ ...carddavSettings, addressBookUrl: e.target.value })}
          />
        </div>
      </div>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Username</div>
          <div className="setting-item-description">
            account username.
          </div>
        </div>
        <div className="setting-item-control">
          <input
            className="textfield"
            type="text"
            placeholder="username"
            autoComplete="off"
            value={carddavSettings.username}
            disabled={locked}
            onChange={e => setCarddavSettings({ ...carddavSettings, username: e.target.value })}
          />
        </div>
      </div>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Password</div>
          <div className="setting-item-description">
            CardDAV account password.
          </div>
        </div>
        <div className="setting-item-control">
          <input
            className="textfield"
            type="password"
            placeholder={savedAuthType === 'basic' ? KEEP_SAVED : 'password'}
            autoComplete="new-password"
            value={carddavSettings.password}
            disabled={locked}
            onChange={e => setCarddavSettings({ ...carddavSettings, password: e.target.value })}
          />
        </div>
      </div>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">API Key</div>
          <div className="setting-item-description">
            API key used instead of username and password.
          </div>
        </div>
        <div className="setting-item-control">
          <input
            className="textfield"
            type="password"
            placeholder={savedAuthType === 'apikey' ? KEEP_SAVED : 'API key'}
            autoComplete="new-password"
            value={carddavSettings.apiKey}
            disabled={locked}
            onChange={e => setCarddavSettings({ ...carddavSettings, apiKey: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
