import * as React from "react";
import {Contact, mdRender} from "src/contacts";
import {vcard} from "src/contacts/vcard";
import {getApp} from "src/context/sharedAppContext";
import {getSettings} from "src/context/sharedSettingsContext";
import {createContactFile, createFileName} from "src/file/file";
import {InsightProcessor, InsightQueItem, PropsRenderGroup, RunType} from "src/insights/insight.d";
import {insightQueueStore} from "src/insights/insightsQueStore";
import {ContactsPluginSettings} from "src/settings/settings";
import {sync} from "src/sync";


const ImportUnknownVcardToVault = async (queItem: InsightQueItem) => {
  const app = getApp();
  const mySettings: ContactsPluginSettings = getSettings();
  const rawCard = await sync.pullFromRemote(queItem.data.href);
  if (rawCard) {
    const records = await vcard.parse(rawCard.raw).next();
    if (records?.value?.[1] && typeof records?.value?.[1] !== 'string') {
      const mdContent = mdRender(records.value[1], mySettings.defaultHashtag);
      createContactFile(app, mySettings.contactsFolder, mdContent, createFileName(records.value[1]))
      await insightQueueStore.remove(queItem);
    }
  }
}

const renderGroup = ({queItems}: PropsRenderGroup): JSX.Element | null => {
  const addVcardsToVault = () => {
    return async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      for (const queItem of queItems) {
        await ImportUnknownVcardToVault(queItem);
      }
    }
  }

  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><strong>Contacts available for import</strong></p>
        <p>
          We found <strong>{queItems.length}</strong> contacts on the remote server that can be added to your vault.
        </p>
      </div>
      <div className="action-card-actions">
        <button className="action-card-button " onClick={addVcardsToVault()}>
          Import All
        </button>
      </div>
    </div>
  );
}

type PropsRender = {
  queItem: InsightQueItem;
  dismissItem: () => void; // Callback for done or close
};

const render = ({queItem, dismissItem}: PropsRender): JSX.Element | null => {
  const addVcardToVault = () => {
    return async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      await ImportUnknownVcardToVault(queItem);
    }
  }

  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><b>{queItem.data.fn}</b> is available on the remote server.</p>
      </div>
      <div className="modal-close-button"
           tabIndex={0}
           role="button"
           aria-label="Close"
           onClick={dismissItem}>
      </div>
      <div className="action-card-actions">
        <button className="action-card-button" onClick={addVcardToVault()}>Add to Vault</button>
      </div>
    </div>
  );
}

export const SyncUnknownProcessor: InsightProcessor = {
  name: "SyncUnknownProcessor",
  runType: RunType.BATCH,
  settingPropertyName: 'SyncUnknownProcessor',
  settingDescription: 'query the configured remote contact server and allow you to decide to import ',
  settingDefaultValue: true,

  render,
  renderGroup,

  async process(contacts: Contact[]): Promise<undefined> {
    const activeProcessor = getSettings().processors[`${this.settingPropertyName}`] as boolean;
    if (!activeProcessor) {
      return;
    }
    const unknownContacts = await sync.getUnknownFromRemote(contacts);
    if (unknownContacts.length === 0) {
      return;
    }

    unknownContacts.map(async (unknownContact) => {
      await insightQueueStore.set({
        name: this.name,
        runType: this.runType,
        file: undefined,
        message: `${unknownContact.fn} is available on remote.`,
        data: unknownContact,
      })
    });
  },

};
