import { TFile } from "obsidian";
import { Contact } from "src/contacts";

type PropsRenderGroup = {
  queItems: InsightQueItem[];
  closeItem: () => void; // Callback for done or close
};

type PropsRender = {
  queItem: InsightQueItem;
  closeItem: () => void; // Callback for done or close
};


export interface InsightQueItem {
  name: string;
  isGrouped: boolean;
  runType: RunType
  file: TFile| undefined;
  message: string;
  data: any | undefined;
  render: (queItem: PropsRender)  => JSX.Element | null;
  renderGroup: ({queItems, closeItem}: PropsRenderGroup) => JSX.Element | null;
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
