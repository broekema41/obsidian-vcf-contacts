import * as React from "react";
import { Contact, mdRender } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { getApp } from "src/context/sharedAppContext";
import { getSettings } from "src/context/sharedSettingsContext";
import { createContactFile, createFileName } from "src/file/file";
import { InsightProcessor, InsightQueItem, RunType } from "src/insights/insight.d";
import { ContactsPluginSettings } from "src/settings/settings";
import { sync } from "src/sync";


const renderGroup = (): JSX.Element | null => {
  return null;
}

type PropsRender = {
  queItem: InsightQueItem;
  closeItem: () => void; // Callback for done or close
};

const render  = ({queItem, closeItem}:PropsRender): JSX.Element | null  => {
  const app = getApp();
  const mySettings:ContactsPluginSettings = getSettings();
  const addVcardToVault = (href: string) => {
    return async (event:  React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rawCard = await sync.pullFromRemote(href);
      if(rawCard) {
        const records = await vcard.parse(rawCard.raw).next();
        if(records?.value?.[1] && typeof records?.value?.[1] !== 'string') {
          const mdContent = mdRender(records.value[1], mySettings.defaultHashtag);
          createContactFile(app, mySettings.contactsFolder, mdContent, createFileName(records.value[1]))
          closeItem();
        }
      }
    }
  }

  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><b>Contact Available</b></p>
        <p><b>{queItem.data.fn}</b> is available on the remote server.</p>
      </div>
      <div className="modal-close-button"
           tabIndex={0}
           role="button"
           aria-label="Close"
           onClick={closeItem}>
      </div>
      <button className="action-card-button" onClick={addVcardToVault(queItem.data.href)}>Add to Vault</button>
    </div>
  );
}

export const SyncUnknownProcessor: InsightProcessor = {
  name: "SyncUnknownProcessor",
  runType: RunType.BATCH,
  isGrouped: false,
  settingPropertyName: 'SyncUnknownProcessor',
  settingDescription: 'query the configured remote contact server and allow you to decide to import ',
  settingDefaultValue: true,

  async process(contacts:Contact[]): Promise<(InsightQueItem | undefined)[]> {
    const activeProcessor = getSettings().processors[`${this.settingPropertyName}`] as boolean;
    if (!activeProcessor ) {
      return [];
    }
    const unknownContacts = await sync.getUnknownFromRemote(contacts);
    if (unknownContacts.length === 0) {
      return [];
    }
    return unknownContacts.map((unknownContact) => {
      return {
        name: this.name,
        runType: this.runType,
        file: undefined,
        message: `${unknownContact.fn} is available on remote.`,
        isGrouped: SyncUnknownProcessor.isGrouped,
        data: unknownContact,
        render,
        renderGroup
      }
    });
  },

};
