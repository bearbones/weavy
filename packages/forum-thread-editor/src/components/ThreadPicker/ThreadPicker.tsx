import { useEditorStore } from "@/store";
import styles from "./ThreadPicker.module.css";

export function ThreadPicker() {
  const threadOrder = useEditorStore((s) => s.project.threadOrder);
  const threads = useEditorStore((s) => s.project.threads);
  const currentThreadId = useEditorStore((s) => s.currentThreadId);
  const setCurrentThreadId = useEditorStore((s) => s.setCurrentThreadId);
  const createThread = useEditorStore((s) => s.createThread);
  const renameThread = useEditorStore((s) => s.renameThread);
  const deleteThread = useEditorStore((s) => s.deleteThread);

  const onlyOneThread = threadOrder.length <= 1;
  const currentThread = threads[currentThreadId];

  const handleRename = () => {
    if (!currentThread) return;
    const next = window.prompt("Rename thread", currentThread.title);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    renameThread(currentThreadId, trimmed);
  };

  const handleDelete = () => {
    if (onlyOneThread || !currentThread) return;
    const confirmed = window.confirm(
      `Delete thread "${currentThread.title}" and all its posts? This can't be undone.`,
    );
    if (!confirmed) return;
    deleteThread(currentThreadId);
  };

  return (
    <div className={styles.picker}>
      <label className={styles.label} htmlFor="thread-picker-select">
        Thread:
      </label>
      <select
        id="thread-picker-select"
        className={styles.select}
        value={currentThreadId}
        onChange={(e) => setCurrentThreadId(e.target.value)}
      >
        {threadOrder.map((id) => {
          const t = threads[id];
          if (!t) return null;
          return (
            <option key={id} value={id}>
              {t.title || "(untitled)"}
            </option>
          );
        })}
      </select>
      <button type="button" onClick={() => createThread()}>
        + New
      </button>
      <button type="button" onClick={handleRename}>
        Rename
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={onlyOneThread}
        title={
          onlyOneThread
            ? "A project must have at least one thread"
            : "Delete this thread"
        }
      >
        Delete
      </button>
    </div>
  );
}
