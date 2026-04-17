import * as React from "react";
import { Notice } from "obsidian";
import { updateSetting } from "src/context/sharedSettingsContext";
import {ContactsPluginSettings, SyncSelected} from "src/settings/settings";
import { useSettings } from "src/ui/hooks/settingsHook";
import { Icon } from "src/ui/sidebar/components/elements/Icon";
import {DEFAULT_SETTINGS} from "../../../settings/setting";
import {parseKey} from "../../../contacts";
import {VCardSupportedKey} from "../../../contacts/vcard";

type ValidateAddFieldResult = {
  valid: boolean;
};

export function CardFieldSettings() {
  const myHookSettings: ContactsPluginSettings|undefined = useSettings();

  const [inputValue, setInputValue] = React.useState<string>("");
  const setAndUppercase = (value: string) => {
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

  const validateAddField =  (fieldkey: string):ValidateAddFieldResult => {
    if (!myHookSettings) {
      return { valid: false };
    }

    if (fieldkey === '') {
      showFieldRejectedNotice(
        `Field name cannot be empty.`
      );
      return { valid: false };
    }

    if (myHookSettings.createFieldsKeys.includes(fieldkey)) {
      showFieldRejectedNotice(
        `Field "${fieldkey}" is already in the list.`
      );
      return { valid: false };
    }

    const field = parseKey(fieldkey);
    const keySupported = field.key in VCardSupportedKey
    const CustomProperty = field.key.startsWith("X-")
    if(keySupported || CustomProperty) {
      return {
        valid: true
      };
    }

    showFieldRejectedNotice(
      `Field "${field.key}" isn’t supported. Check the plugin README for supported fields, or prefix custom fields with X-.`
    );

    return {
      valid: false
    };
  }

  const handleAddField = () => {
    if (!myHookSettings) return;
    const {valid} = validateAddField(inputValue)
    if(!valid) {
      return;
    }

    const updated = [...myHookSettings.createFieldsKeys, inputValue];
    updateSetting("createFieldsKeys", updated);
    setInputValue('');
  }

  const showFieldRejectedNotice = (message: string) => {
    const fragment = document.createDocumentFragment();

    const title = document.createElement("strong");
    title.textContent = "Field blocked";
    title.style.color = "var(--text-error)";

    const br = document.createElement("br");

    const text = document.createElement("span");
    text.textContent = message;

    fragment.appendChild(title);
    fragment.appendChild(br);
    fragment.appendChild(text);

    new Notice(fragment, 5000);
  };


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
              onChange={(e) => setAndUppercase(e.target.value)}
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
