import { useCallback } from "react";
import { useEditorStore } from "@/store";
import { packProject, unpackProject } from "@/utils/bundle";
import { downloadBlob, slugify } from "@/utils/download";

export function useProjectIO() {
  const exportBundle = useCallback(async () => {
    try {
      const project = useEditorStore.getState().project;
      const blob = await packProject(project);
      const name = `${slugify(project.projectTitle || "forum-project")}.zip`;
      downloadBlob(name, blob);
      useEditorStore.getState().setIoError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      useEditorStore.getState().setIoError(`Export failed: ${msg}`);
    }
  }, []);

  const importBundle = useCallback(async (file: File) => {
    try {
      const project = await unpackProject(file);
      useEditorStore.getState().loadProject(project);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      useEditorStore.getState().setIoError(`Import failed: ${msg}`);
    }
  }, []);

  return { exportBundle, importBundle };
}
