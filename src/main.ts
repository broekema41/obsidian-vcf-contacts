import "src/insights/insightLoading";

import {Notice, Plugin} from 'obsidian';
import { initSettings } from "src/context/sharedSettingsContext";
import { ContactsSettingTab } from 'src/ui/settings/settingsView';
import { ContactsView } from "src/ui/sidebar/sidebarView";
import { CONTACTS_VIEW_CONFIG } from "src/util/constants";
import myScrollTo from "src/util/myScrollTo";

import { ContactsPluginSettings } from  './settings/settings.d';
import {vcard} from "./contacts/vcard";
import {updateFrontMatter} from "./contacts";

export default class ContactsPlugin extends Plugin {
	settings: ContactsPluginSettings;

	async onload() {

		await initSettings(this.loadData.bind(this), this.saveData.bind(this));
		this.registerView(
			CONTACTS_VIEW_CONFIG.type,
			(leaf) => new ContactsView(leaf, this)
		);

		this.addRibbonIcon('contact', 'Contacts', () => {
			this.activateSidebarView();
      myScrollTo.handleLeafEvent(null);
		});

		this.addSettingTab(new ContactsSettingTab(this.app, this));

    this.addCommand({
      id: 'contacts-sidebar',
      name: "Open Contacts Sidebar",
      callback: () => {
        this.activateSidebarView();
      },
    });

    this.addCommand({
      id: 'contacts-create',
      name: "Create Contact",
      callback: async () => {
        const leaf = await this.activateSidebarView();
        leaf?.createNewContact()
      },
    });

    this.addCommand({
      id: "contacts-apply-default-fields",
      name: "Apply Default Fields to Current File",
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new Notice("No active file.");
          return;
        }
        const records = await vcard.addDefaultFields(file);
        updateFrontMatter(file, records)
      }
    });
	}

	onunload() {}


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

    // Grab the leaf
    const leaf = this.app.workspace.getLeavesOfType(CONTACTS_VIEW_CONFIG.type)[0];
    if (!leaf) return null;

    await this.app.workspace.revealLeaf(leaf);
    return leaf.view as ContactsView;
	}
}
