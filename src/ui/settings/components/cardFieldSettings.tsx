import * as React from "react";
import { updateSetting } from "src/context/sharedSettingsContext";
import {ContactsPluginSettings, SyncSelected} from "src/settings/settings";
import { useSettings } from "src/ui/hooks/settingsHook";
import { Icon } from "src/ui/sidebar/components/elements/Icon";
import {DEFAULT_SETTINGS} from "../../../settings/setting";

export function CardFieldSettings() {
  const myHookSettings: ContactsPluginSettings|undefined = useSettings();

  const [inputValue, setInputValue] = React.useState<string>("");
  const setAndValidate = (value: string) => {
    const upperValue = value.toUpperCase();
      setInputValue(upperValue);
  }

  const handleFieldsSettingReset = () => {
    updateSetting("createFieldsKeys", DEFAULT_SETTINGS.createFieldsKeys);
  };

  const removeFieldKey = (keyToRemove: string) => {
    if (!myHookSettings) return;

    const updated = myHookSettings.createFieldsKeys.filter(
      (k) => k !== keyToRemove
    );

    updateSetting("createFieldsKeys", updated);
  };

  const handleAddField = () => {
    if (!myHookSettings) return;

    const updated = [...myHookSettings.createFieldsKeys, inputValue];

    updateSetting("createFieldsKeys", updated);
  }

  return (
      <div className="setting-item-spacer">
        <div className="setting-item setting-item-heading">
          <div className="setting-item-info">
            <div className="setting-item-name">Default Contact Fields</div>
            <div className="setting-item-description">Fields created when adding a new contact</div>
          </div>
        </div>
        <div className="setting-item-control">
          <div className="settings-tag-list">
            {myHookSettings?.createFieldsKeys?.map((key, index) => (
              <a key={index}
                 onClick={() => removeFieldKey(key)}
                 className="tag">
                {key}
                <Icon name="trash-2" />
              </a>
            ))}
          </div>
        </div>

        <div className="setting-item ">
          <div className="setting-item-info">
            <div className="setting-item-name">Add Field</div>
          </div>
          <div className="setting-item-control">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setAndValidate(e.target.value)}
              placeholder="Enter field name"
            />
            <button onClick={handleAddField}>
              Add
            </button>
          </div>
        </div>

        <div className="setting-item ">
          <div className="setting-item-info">
            <div className="setting-item-name">Reset Fields Configuration</div>
          </div>
          <div className="setting-item-control">
            <button
              className="mod-destructive"
              onClick={handleFieldsSettingReset}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    )
}
