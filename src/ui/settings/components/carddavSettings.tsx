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

// Looks like a filled-in field; the real secret is never put back in the form.
const SAVED_MASK = '••••••••';
const SAVED_TITLE = 'Saved. Type to replace it.';

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
          <div className="setting-item-name">Address book URL</div>
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
            Username of your CardDAV account.
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
            Password of your CardDAV account.
          </div>
        </div>
        <div className="setting-item-control">
          <div className="vcf-secret-field">
            <input
              className={savedAuthType === 'basic' ? 'textfield is-saved' : 'textfield'}
              type="password"
              placeholder={savedAuthType === 'basic' ? SAVED_MASK : 'password'}
              title={savedAuthType === 'basic' ? SAVED_TITLE : undefined}
              autoComplete="new-password"
              value={carddavSettings.password}
              disabled={locked}
              onChange={e => setCarddavSettings({ ...carddavSettings, password: e.target.value })}
            />
            {savedAuthType === 'basic' && !locked ? <ForgetButton label="Forget saved password" onClick={onForgetSaved}/> : null}
          </div>
        </div>
      </div>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">API key</div>
          <div className="setting-item-description">
            Used instead of a username and password.
          </div>
        </div>
        <div className="setting-item-control">
          <div className="vcf-secret-field">
            <input
              className={savedAuthType === 'apikey' ? 'textfield is-saved' : 'textfield'}
              type="password"
              placeholder={savedAuthType === 'apikey' ? SAVED_MASK : 'API key'}
              title={savedAuthType === 'apikey' ? SAVED_TITLE : undefined}
              autoComplete="new-password"
              value={carddavSettings.apiKey}
              disabled={locked}
              onChange={e => setCarddavSettings({ ...carddavSettings, apiKey: e.target.value })}
            />
            {savedAuthType === 'apikey' && !locked ? <ForgetButton label="Forget saved API key" onClick={onForgetSaved}/> : null}
          </div>
        </div>
      </div>
    </>
  );
}
