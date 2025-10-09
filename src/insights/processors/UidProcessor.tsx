import * as React from "react";
import { Contact, updateFrontMatterValue } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import { InsightProcessor, InsightQueItem, PropsRenderGroup, RunType } from "src/insights/insight.d";
import { insightQueueStore } from "src/insights/insightsQueStore";
import { generateUUID } from "src/util/vcard";

const renderGroup = ({queItems, closeItem}:PropsRenderGroup): JSX.Element | null  => {
  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><b>{queItems.length} UID's generates</b></p>
        <p>Unique Contact identifiers generated for your contacts where they where absent.</p>
      </div>
      <div className="modal-close-button"
           tabIndex={0}
           role="button"
           aria-label="Close"
           onClick={closeItem}>
      </div>
    </div>
  );
}

const render= (): JSX.Element | null => {
  return null;
}

export const UidProcessor: InsightProcessor = {
  name: "UidProcessor",
  runType: RunType.IMMEDIATELY,
  settingPropertyName: 'UidProcessor',
  settingDescription: 'Generates a unique identifier for contact when missing.',
  settingDefaultValue: true,

  render,
  renderGroup,

  async process(contacts: Contact[]): Promise<undefined> {
    const activeProcessor = getSettings().processors[`${this.settingPropertyName}`] as boolean;

    for (const contact of contacts) {
      if (!activeProcessor || contact.data['UID']) {
        return undefined;
      }

      const UUID = `urn:uuid:${generateUUID()}`;
      await updateFrontMatterValue(contact.file, 'UID', UUID);

      await insightQueueStore.set({
        name: this.name,
        runType: this.runType,
        file: contact.file,
        message: `Generated Unique user identifier for Contact ${contact.file.name}.`,
        data: undefined,
      });
    }
  }
}
