import "src/insights/insightLoading";

import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from "src/settings/setting";
import { ContactsSettingTab } from 'src/ui/settings/settingsView';
import { ContactsView } from "src/ui/sidebar/sidebarView";
import { CONTACTS_VIEW_CONFIG } from "src/util/constants";
import myScrollTo from "src/util/myScrollTo";

import { ContactsPluginSettings } from  './settings/settings.d';

export default class ContactsPlugin extends Plugin {
	settings: ContactsPluginSettings;

	async onload() {

		await this.loadSettings();
		this.registerView(
			CONTACTS_VIEW_CONFIG.type,
			(leaf) => new ContactsView(leaf, this)
		);

		this.addRibbonIcon('contact', 'Contacts', () => {
			this.activateSidebarView();
      myScrollTo.handleLeafEvent(null);
		});

		this.addSettingTab(new ContactsSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
    // Decided to explicitly merge the settings for now to prevent a deep clone function
    const loaded = await this.loadData() ?? {};
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      CardDAV: {
        ...DEFAULT_SETTINGS.CardDAV,
        ...(loaded.CardDAV ?? {})
      },
      processors: {
        ...DEFAULT_SETTINGS.processors,
        ...(loaded.processors ?? {})
      }
    };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateSidebarView() {
		if (this.app.workspace.getLeavesOfType(CONTACTS_VIEW_CONFIG.type).length < 1) {
      const leaf = this.app.workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: CONTACTS_VIEW_CONFIG.type,
          active: true,
        });
      }
		}

		await this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(CONTACTS_VIEW_CONFIG.type)[0]
		);
	}
}
