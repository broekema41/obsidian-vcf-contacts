import * as React from "react";
import { Contact } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import { InsightProcessor, InsightQueItem, RunType } from "src/insights/insight.d";


const renderGroup = (queItems: InsightQueItem[]):JSX.Element => {
  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><b>{queItems.length} UID's generates</b></p>
        <p>Unique Contact identifiers generated for your contacts where they where absent.</p>
      </div>
    </div>
  );
}

const render = (queItem: InsightQueItem):JSX.Element => {
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
  settingPropertyName: 'SyncUnknownProcessor',
  settingDescription: 'query the configured remote contact server and allow you to decide to delete or import ',
  settingDefaultValue: true,

  async process(contacts:Contact[]): Promise<InsightQueItem[] | undefined> {
    const activeProcessor = getSettings().processors[`${this.settingPropertyName}`] as boolean;
    if (!activeProcessor ) {
      return Promise.resolve(undefined);
    }

    console.log(contacts);

    return Promise.resolve(undefined);
  },

};
