import { signal } from "@preact/signals-core";
import type { App } from 'obsidian';

export const app = signal<App | undefined>(undefined);

export function setApp(appInput: App) {
  app.value = appInput;
}

export function getApp(): App {
  const current = app.peek(); // avoid tracking if used in non-reactive contexts
  if (!current) throw new Error('App context has not been set.');
  return current;
}

export function clearApp() {
  app.value = undefined;
}
