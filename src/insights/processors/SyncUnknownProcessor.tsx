import * as React from "react";
import { Contact } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import { InsightProcessor, InsightQueItem, RunType } from "src/insights/insight.d";
import { sync } from "src/sync";

const renderGroup = (): JSX.Element | null => {
  return null;
}

const render = (queItem: InsightQueItem): JSX.Element | null  => {
  return (
    <div className="action-card">
      <div className="action-card-content">
        <p>{queItem.message}</p>
      </div>
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
      return Promise.resolve([undefined]);
    }
    console.log(contacts);
    const unknownContacts = await sync.getUnknownFromRemote(contacts);
    console.log(unknownContacts);
    return Promise.resolve([undefined]);
  },

};
