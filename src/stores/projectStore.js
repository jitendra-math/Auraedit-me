import { writable } from "svelte/store";

// Active opened file id
export const activeFileId = writable(null);

// Selected folder for creating files
export const selectedFolderId = writable(null);

// Current project name
export const projectName = writable("");

// UI state
export const sidebarOpen = writable(false);

// Helper setters (clean usage)
export const setActiveFile = (id) => {
  activeFileId.set(id);
};

export const setSelectedFolder = (id) => {
  selectedFolderId.set(id);
};

export const setProjectName = (name) => {
  projectName.set(name);
};