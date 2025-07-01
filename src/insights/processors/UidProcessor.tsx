import * as React from "react";
import { Contact, updateFrontMatterValue } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import { InsightProcessor, InsightQueItem, RunType } from "src/insights/insight.d";
import { generateUUID } from "src/util/vcard";



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

export const UidProcessor: InsightProcessor = {
  name: "UidProcessor",
  runType: RunType.IMMEDIATELY,
  settingPropertyName: 'UidProcessor',
  settingDescription: 'Generates a unique identifier for contact when missing.',
  settingDefaultValue: true,

  async process(contact:Contact): Promise<InsightQueItem | undefined> {
    const activeProcessor = getSettings().processors[`${this.settingPropertyName}`] as boolean;
    if (!activeProcessor || contact.data['UID']) {
      return Promise.resolve(undefined);
    }

    const UUID = `urn:uuid:${generateUUID()}`
    await updateFrontMatterValue(contact.file, 'UID', UUID)

    return Promise.resolve({
      name: this.name,
      runType: this.runType,
      file: contact.file,
      message: `Generated Unique user identifier for Contact ${contact.file.name}.`,
      render,
      renderGroup
    });
  },

};



