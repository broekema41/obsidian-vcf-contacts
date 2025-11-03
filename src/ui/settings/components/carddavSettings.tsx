import * as React from "react";

export interface CarddavSettingsInterface {
  addressBookUrl: string;
  username: string;
  password: string;
  authKey: string;
}

interface CarddavSettingsProps {
  carddavSettings: CarddavSettingsInterface;
  setCarddavSettings: (settings: CarddavSettingsInterface) => void;
}

export default function CarddavSettings({ carddavSettings, setCarddavSettings }: CarddavSettingsProps) {

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
            value={carddavSettings.username}
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
            placeholder="password"
            value={carddavSettings.password}
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
            type="text"
            placeholder="API key"
            value={carddavSettings.authKey}
            onChange={e => setCarddavSettings({ ...carddavSettings, authKey: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
