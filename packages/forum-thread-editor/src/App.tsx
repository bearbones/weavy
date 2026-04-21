import { useEditorStore } from "@/store";
import { useLocalStoragePersistence } from "@/hooks/use-local-storage-persistence";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { ThreadView } from "@/components/ThreadView/ThreadView";
import { UsersView } from "@/components/UsersView/UsersView";
import styles from "./App.module.css";

export function App() {
  useLocalStoragePersistence();
  const hydrated = useEditorStore((s) => s.hydrated);
  const currentView = useEditorStore((s) => s.currentView);

  if (!hydrated) {
    return <div className={styles.loading}>Loading…</div>;
  }

  return (
    <div className={styles.app}>
      <Toolbar />
      <main className={styles.main}>
        {currentView === "thread" ? <ThreadView /> : <UsersView />}
      </main>
    </div>
  );
}
