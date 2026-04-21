import { useRef } from "react";
import { useEditorStore } from "@/store";
import { useProjectIO } from "@/hooks/use-project-io";
import styles from "./Toolbar.module.css";

export function Toolbar() {
  const currentView = useEditorStore((s) => s.currentView);
  const setCurrentView = useEditorStore((s) => s.setCurrentView);
  const ioError = useEditorStore((s) => s.ioError);
  const setIoError = useEditorStore((s) => s.setIoError);
  const createUser = useEditorStore((s) => s.createUser);
  const setEditingUserId = useEditorStore((s) => s.setEditingUserId);
  const { exportBundle, importBundle } = useProjectIO();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => importInputRef.current?.click();
  const handleImportChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await importBundle(file);
  };

  const handleNewUser = () => {
    const id = createUser({ name: "New user" });
    setCurrentView("users");
    setEditingUserId(id);
  };

  return (
    <div className={styles.toolbarWrap}>
      <header className={styles.toolbar}>
        <div className={styles.brand}>Forum Thread Editor</div>
        <div className={styles.tabs}>
          <button
            type="button"
            className={currentView === "thread" ? styles.tabActive : styles.tab}
            onClick={() => setCurrentView("thread")}
          >
            Thread
          </button>
          <button
            type="button"
            className={currentView === "users" ? styles.tabActive : styles.tab}
            onClick={() => setCurrentView("users")}
          >
            Users
          </button>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={handleNewUser}>
            + New user
          </button>
          <button type="button" onClick={handleImportClick}>
            Import bundle
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleImportChange}
            className={styles.hiddenInput}
          />
          <button
            type="button"
            className={styles.primary}
            onClick={exportBundle}
          >
            Export bundle
          </button>
        </div>
      </header>
      {ioError && (
        <div className={styles.error} role="alert">
          <span>{ioError}</span>
          <button type="button" onClick={() => setIoError(null)}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
