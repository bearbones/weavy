import { useEffect } from "react";
import { useEditorStore } from "@/store";
import type { Asset, ForumProject } from "@/types";
import sampleProject from "@/fixtures/sample-project.json";
import { migrateProject } from "@/utils/migrate";

const STORAGE_KEY = "forum-thread-editor:project:v1";
const DEBOUNCE_MS = 200;

function readStored(): ForumProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return migrateProject<Asset>(parsed);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to read stored project:", err);
    return null;
  }
}

function writeStored(project: ForumProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to persist project:", err);
  }
}

function loadSample(): ForumProject {
  return migrateProject<Asset>(sampleProject);
}

export function useLocalStoragePersistence(): void {
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      useEditorStore.getState().loadProject(stored);
    } else {
      useEditorStore.getState().loadProject(loadSample());
    }
    useEditorStore.getState().markHydrated();

    let handle: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = useEditorStore.subscribe((state, prev) => {
      if (state.project === prev.project) return;
      if (handle) clearTimeout(handle);
      handle = setTimeout(() => {
        writeStored(state.project);
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (handle) clearTimeout(handle);
    };
  }, []);
}
