import { useViewerStore } from "@/store";
import styles from "./NavigationControls.module.css";

export function NavigationControls() {
  const sections = useViewerStore((s) => s.sections);
  const currentIndex = useViewerStore((s) => s.currentSectionIndex);
  const viewedCount = useViewerStore((s) => s.viewedSectionIds.size);
  const goToPreviousSection = useViewerStore((s) => s.goToPreviousSection);
  const goToNextSection = useViewerStore((s) => s.goToNextSection);

  if (sections.length === 0) return null;

  const progress = sections.length > 0
    ? Math.round((viewedCount / sections.length) * 100)
    : 0;

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <span className={styles.title}>Narrative Diff</span>
      </div>

      <div className={styles.center}>
        <button
          className={styles.navButton}
          onClick={goToPreviousSection}
          disabled={currentIndex === 0}
          aria-label="Previous section"
        >
          &#8593;
        </button>
        <span className={styles.counter}>
          {currentIndex + 1} / {sections.length}
        </span>
        <button
          className={styles.navButton}
          onClick={goToNextSection}
          disabled={currentIndex === sections.length - 1}
          aria-label="Next section"
        >
          &#8595;
        </button>
      </div>

      <div className={styles.right}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {viewedCount}/{sections.length} reviewed
        </span>
      </div>
    </nav>
  );
}
