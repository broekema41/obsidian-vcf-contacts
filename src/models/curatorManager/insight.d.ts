import { TFile } from "obsidian";
import { Contact } from "src";

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
  process(contact: Contact): Promise<InsightQueItem | undefined>;
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
  UPCOMMING = 'upcoming',
  INPROVEMENT = 'inprovement',
}
