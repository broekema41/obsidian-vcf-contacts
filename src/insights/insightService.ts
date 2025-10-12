
import { signal } from "@preact/signals-core";
import { Contact } from "src/contacts";
import { InsighSettingProperties, InsightProcessor, RunType } from "src/insights/insight.d";
import {insightQueueStore} from "./insightsQueStore";

let backgroundTimer: number | null = null;
let contacts:Contact[] = [];
const processors = new Map<string, InsightProcessor>();
const backgroundProcessRunning = signal(false);

const processContacts  = async ( runType: RunType) => {
  const normalizedContacts = Array.isArray(contacts) ? contacts : [contacts];
  for (const processor of processors.values()) {
    if (processor.runType === runType) {
        await processor.process(normalizedContacts)
    }
  }
}

const processAll = async () => {
  backgroundProcessRunning.value = true;
  try {
    insightQueueStore.clear();
    await insightService.process(RunType.IMMEDIATELY);
    await insightService.process(RunType.BATCH);
    await insightService.process(RunType.INPROVEMENT);
    setTimeout(() => {
      backgroundProcessRunning.value = false;
    }, 100);
  } catch (err) {
    backgroundProcessRunning.value = false;
    console.warn('While running insights background process and error occurred', err);
  }
}

const startBackgroundProcess = () => {
  if (!backgroundTimer) {
    // TODO: Every 5 minutes make this a setting at some point.
    backgroundTimer = window.setInterval(processAll, 5 * 60 * 1000);
    setTimeout(processAll, 2000); // Run after obsidian is initialized
  }
}

export const insightService = {

  backgroundProcessRunning,

  register(processor: InsightProcessor) {
    processors.set(processor.name, processor);

    startBackgroundProcess();
  },

  getProcessorByName(name: string): InsightProcessor | undefined {
    return processors.get(name);
  },

  setContacts(currentContacts: Contact[]) {
    /**
     * We do some object cloning here just so that the
     * processors do not accidentally mutate the apps core state
     */
    contacts = currentContacts.map((mapContact) => {
      return Object.assign({}, {
        file: { ...mapContact.file },
        data: { ...mapContact.data }
      });
    });
  },

  async process(runType: RunType) {
      await processContacts(runType);
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
