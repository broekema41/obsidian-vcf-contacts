// Minimal mocks for Obsidian API - only what's needed for tests
export const App = {};
export class Modal {}  // Needs to be a class since FileExistsModal extends it
export const Notice = {};
export const TFile = {};
export const TFolder = {};
export const Vault = { recurseChildren: () => {} };
export const Workspace = {};
export const normalizePath = (path: string) => path;
export const Platform = { isMobileApp: false, isAndroidApp: false };
