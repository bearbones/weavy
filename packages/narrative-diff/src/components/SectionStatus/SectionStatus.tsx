import { useViewerStore } from "@/store";
import styles from "./SectionStatus.module.css";

interface SectionStatusProps {
  sectionId: string;
}

export function SectionStatus({ sectionId }: SectionStatusProps) {
  const isViewed = useViewerStore((s) => s.viewedSectionIds.has(sectionId));
  const isPinned = useViewerStore((s) => s.pinnedSectionIds.has(sectionId));
  const toggleViewed = useViewerStore((s) => s.toggleViewed);
  const togglePinned = useViewerStore((s) => s.togglePinned);

  return (
    <div className={styles.status}>
      <button
        className={`${styles.button} ${isPinned ? styles.active : ""}`}
        onClick={() => togglePinned(sectionId)}
        title={isPinned ? "Unpin section" : "Pin section"}
        aria-label={isPinned ? "Unpin section" : "Pin section"}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.456.734a1.75 1.75 0 0 1 2.826.504l.613 1.327a3.08 3.08 0 0 0 2.084 1.707l2.454.584c1.332.317 1.8 1.972.832 2.94L11.06 10l3.72 3.72a.749.749 0 1 1-1.06 1.06L10 11.06l-2.204 2.205c-.968.968-2.623.5-2.94-.832l-.584-2.454a3.08 3.08 0 0 0-1.707-2.084l-1.327-.613a1.75 1.75 0 0 1-.504-2.826L4.456.734Z" />
        </svg>
      </button>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={isViewed}
          onChange={() => toggleViewed(sectionId)}
        />
        <span className={styles.checkmark}>
          {isViewed ? "Viewed" : "Mark viewed"}
        </span>
      </label>
    </div>
  );
}
