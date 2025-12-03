import { App, PluginSettingTab } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import ContactsPlugin from "src/main";
import { InsightSettings } from "src/ui/settings/components/insightsSettings";
import { MasterSetting } from "src/ui/settings/components/masterSettings";
import { SynchronizationSettings } from "src/ui/settings/components/synchronizationSettings";

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
        />
        <InsightSettings />
        <SynchronizationSettings />
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
