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
  /** Forget the saved password or API key. */
  onForgetSaved: () => void;
}

const KEEP_SAVED = 'Saved, leave empty to keep';

function ForgetButton({ label, onClick }: { label: string; onClick: () => void }) {
  // Lucide "x", the icon Obsidian uses for clearing.
  return (
    <button type="button" className="clickable-icon" aria-label={label} title={label} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-x">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    </button>
  );
}

export default function CarddavSettings({ carddavSettings, setCarddavSettings, savedAuthType, locked, onForgetSaved }: CarddavSettingsProps) {

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
          {savedAuthType === 'basic' && !locked ? <ForgetButton label="Forget saved password" onClick={onForgetSaved}/> : null}
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
          {savedAuthType === 'apikey' && !locked ? <ForgetButton label="Forget saved API key" onClick={onForgetSaved}/> : null}
        </div>
      </div>
    </>
  );
}
