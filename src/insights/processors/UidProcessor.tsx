import * as React from "react";
import { Contact, updateFrontMatterValue } from "src/contacts";
import { getSettings } from "src/context/sharedSettingsContext";
import {InsightProcessor, PropsRender, PropsRenderGroup, RunType} from "src/insights/insight.d";
import { insightQueueStore } from "src/insights/insightsQueStore";
import { generateUUID } from "src/util/vcard";

const renderGroup = ({queItems}:PropsRenderGroup): JSX.Element | null  => {
  const dismissAll = () => {
    return async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      for (const queItem of queItems) {
        await insightQueueStore.dismissItem(queItem);
      }
    }
  }

  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><b>{queItems.length} UID's generated</b></p>
        <p>Unique Contact identifiers generated where they where absent.</p>
      </div>
      <div className="action-card-actions">
        <button className="action-card-button" onClick={dismissAll()}>
          dismiss All
        </button>
      </div>
    </div>
  );
}

const render = ({queItem, dismissItem}: PropsRender): JSX.Element | null => {
  return (
    <div className="action-card">
      <div className="action-card-content">
        <p><b>{queItem.data.fn}</b> {queItem.message}</p>
      </div>
      <div className="modal-close-button"
           tabIndex={0}
           role="button"
           aria-label="Close"
           onClick={dismissItem}>
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
        message: `Now has a Generated Unique user identifier`,
        data: { name: this.name, uuid: UUID, fn: contact.data['FN']}
      });
    }
  }
}
