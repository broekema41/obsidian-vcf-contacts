import { TFile } from "obsidian";
import { Contact } from "src/contacts";

export interface InsightQueItem {
  name: string;
  isGrouped: boolean;
  runType: RunType
  file: TFile;
  message: string;
  render: (queItem: InsightQueItem) => JSX.Element | null;
  renderGroup: (queItems: InsightQueItem[]) => JSX.Element | null;
}

export interface InsightProcessor {
  name: string;
  isGrouped: boolean;
  runType: RunType
  settingPropertyName: string;
  settingDescription: string;
  settingDefaultValue: boolean;
  process(contacts: Contact[]): Promise<(InsightQueItem | undefined)[]>;
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
