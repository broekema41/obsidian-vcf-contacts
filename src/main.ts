import "src/insights/insightLoading";

import { Plugin } from 'obsidian';
import { ContactsView } from "src/ui/sidebar/sidebarView";
import { CONTACTS_VIEW_CONFIG } from "src/util/constants";
import myScrollTo from "src/util/myScrollTo";
import { ContactsPluginSettings } from  './settings/settings.d';
import { ContactsSettingTab, DEFAULT_SETTINGS } from './settings/settings';

export default class ContactsPlugin extends Plugin {
	settings: ContactsPluginSettings;
	private ribbonIconEl: HTMLElement | null = null;

	async onload() {

		await this.loadSettings();
		this.registerView(
			CONTACTS_VIEW_CONFIG.type,
			(leaf) => new ContactsView(leaf, this)
		);

		this.ribbonIconEl = this.addRibbonIcon('contact', 'Contacts', () => {
			this.activateSidebarView();
      myScrollTo.handleLeafEvent(null);
		});

		this.addSettingTab(new ContactsSettingTab(this.app, this));
	}

	onunload() {
		// Clean up all views of this type
		this.app.workspace.detachLeavesOfType(CONTACTS_VIEW_CONFIG.type);
		
		// Remove ribbon icon if it exists
		if (this.ribbonIconEl) {
			this.ribbonIconEl.remove();
			this.ribbonIconEl = null;
		}
		
		// Clear cached settings to prevent stale data on reload
		this.settings = null as any;
		
		// Reset scroll utility state
		myScrollTo.reset();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
