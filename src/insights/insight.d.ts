import { TFile } from "obsidian";
import { Contact } from "src/contacts";

export interface InsightQueItem {
  name: string;
  runType: RunType
  file: TFile;
  message: string;
  render: (queItem: InsightQueItem) => JSX.Element;
  renderGroup: (queItems: InsightQueItem[]) => JSX.Element;
}

export interface InsightProcessor {
  name: string;
  runType: RunType
  settingPropertyName: string;
  settingDescription: string;
  settingDefaultValue: boolean;
  process(contact: Contact|Contact[]): Promise<InsightQueItem | InsightQueItem[] |  undefined>;
}


export interface InsighSettingProperties {
  name: string;
  runType: RunType;
  settingPropertyName: string;
  settingDescription: string;
  settingDefaultValue: boolean;
}

export enum RunType {
  IMMEDIATELY = 'immediately',
  INPROVEMENT = 'inprovement',
  BATCH = 'batch',
}
