import { useViewerStore } from "@/store";
import { DiffSection } from "@/components/DiffSection/DiffSection";
import styles from "./CrossLinkPanel.module.css";

export function CrossLinkPanel() {
  const activeCrossLinkSectionId = useViewerStore(
    (s) => s.activeCrossLinkSectionId,
  );
  const sections = useViewerStore((s) => s.sections);
  const closeCrossLink = useViewerStore((s) => s.closeCrossLink);

  if (!activeCrossLinkSectionId) return null;

  const linkedSection = sections.find(
    (s) => s.id === activeCrossLinkSectionId,
  );
  if (!linkedSection) return null;

  const linkedIndex = sections.indexOf(linkedSection);

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Cross-link: {linkedSection.heading}</span>
        <button
          className={styles.closeButton}
          onClick={closeCrossLink}
          aria-label="Close cross-link panel"
        >
          &times;
        </button>
      </div>
      <div className={styles.content}>
        <DiffSection
          section={linkedSection}
          index={linkedIndex}
          focused={true}
        />
      </div>
    </aside>
  );
}
