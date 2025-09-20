import * as React from "react";
import { Contact } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import { InsightProcessor, InsightQueItem, PropsRenderGroup, RunType } from "src/insights/insight.d";
import { sync } from "src/sync";

const renderGroup = (): JSX.Element | null => {
  return null;
}

type PropsRender = {
  queItem: InsightQueItem;
  closeItem: () => void; // Callback for done or close
};

const render  = ({queItem, closeItem}:PropsRender): JSX.Element | null  => {
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
      <button className="action-card-button" onClick={closeItem}>Add to Vault</button>
    </div>
  );
}

export const SyncUnknownProcessor: InsightProcessor = {
  name: "SyncUnknownProcessor",
  runType: RunType.BATCH,
  isGrouped: false,
  settingPropertyName: 'SyncUnknownProcessor',
  settingDescription: 'query the configured remote contact server and allow you to decide to delete or import ',
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
