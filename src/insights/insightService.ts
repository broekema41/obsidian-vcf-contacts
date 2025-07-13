
import { Contact } from "src/contacts";
import { InsighSettingProperties, InsightProcessor, InsightQueItem, RunType } from "src/insights/insight.d";

const processors = new Map<string, InsightProcessor>();

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

const processContacts  = async (contacts:Contact | Contact[], runType: RunType) => {
  const insights:InsightQueItem[] = [];
  const normalizedContacts = Array.isArray(contacts) ? contacts : [contacts];
  for (const processor of processors.values()) {
    if (processor.runType === runType) {
        const que = await processor.process(normalizedContacts)
        const queItems = que.filter(isDefined);
        insights.push(...queItems);
    }
  }
  return insights
}

export const insightService = {

  register(processor: InsightProcessor) {
    processors.set(processor.name, processor);
  },

  async process(contacts: Contact|Contact[], runType: RunType): Promise<InsightQueItem[]> {
      return await processContacts(contacts, runType);
  },

  settings(): InsighSettingProperties[] {
    return Array.from(processors.values()).map(processor => ({
      name: processor.name,
      runType: processor.runType,
      settingPropertyName: processor.settingPropertyName,
      settingDescription: processor.settingDescription,
      settingDefaultValue: processor.settingDefaultValue,
    }));
  }

}
