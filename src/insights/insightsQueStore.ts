import { signal } from "@preact/signals-core";
import { InsightQueItem } from "src/insights/insight";

const store = new Map<string, InsightQueItem>();
const dismissedItems = new Map<string, string>();
const insightQueItemCount = signal(0);

async function keyFromData(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const str = JSON.stringify(data ?? {});
  const encoded = encoder.encode(str);

  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  // Keep it short but unique enough
  return hashHex.slice(0, 16);
}

async function generateKey(item: InsightQueItem): Promise<string> {
  const key = await keyFromData(item.data);
  return `${item.name}-${key}`;
}

function updateCount() {
  insightQueItemCount.value = Array.from(
    new Set(
      Array.from(store.entries())
        .filter(([key]) => !dismissedItems.has(key))
    )).length;
}

export const insightQueueStore = {
  insightQueItemCount,

  async set(item: InsightQueItem): Promise<void> {
    const key = await generateKey(item);
    store.set(key, item);
    updateCount();
  },

  getProcessorsInStore(): string[] {
    return Array.from(
      new Set(
        Array.from(store.entries())
          .filter(([key]) => !dismissedItems.has(key))
          .map(([, i]) => i.name)
    ));
  },

  getByName(name: string): InsightQueItem[] {
    return Array.from(store.entries())
      .filter(([key, i]) => !dismissedItems.has(key) && i.name === name)
      .map(([, i]) => i);
  },

  async has(item: InsightQueItem): Promise<boolean> {
    const key = await generateKey(item);
    return store.has(key);
  },

  async remove(item: InsightQueItem): Promise<void> {
    const key = await generateKey(item);
    store.delete(key);
    updateCount();
  },

  async dismissItem(item: InsightQueItem) {
    const key = await generateKey(item);
    dismissedItems.set(key, key);
    updateCount();
  },

  clear(): void {
    store.clear();
    updateCount();
  },
};
