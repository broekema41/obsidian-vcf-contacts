import { App, PluginSettingTab } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { insightService } from "src/insights/insightService";
import ContactsPlugin from "src/main";
import { ContactsPluginSettings } from "src/settings/settings"
import { InsightSettings } from "src/ui/settings/components/insightsSettings";
import { MasterSetting } from "src/ui/settings/components/masterSettings";

const insightsSetting = insightService.settings();
const insightsSettingDefaults = insightsSetting.reduce((acc:Record<string, string|boolean>, setting) => {
  acc[setting.settingPropertyName] = setting.settingDefaultValue;
  return acc;
}, {} as Record<string, string>);

export const DEFAULT_SETTINGS: ContactsPluginSettings = {
  contactsFolder: '',
  defaultHashtag: '',
  ...insightsSettingDefaults
}

export class ContactsSettingTab extends PluginSettingTab {
  plugin: ContactsPlugin;
  app: App;
  root: Root | null;

  constructor(app: App, plugin: ContactsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }


  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.root = createRoot(containerEl);
    this.root.render(
      <>
        <MasterSetting
          app={this.app}
          plugin={this.plugin}
        />
        <InsightSettings
          plugin={this.plugin}
          insightsSetting={insightsSetting}
        />

      </>
    );
  }

  hide(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

}
