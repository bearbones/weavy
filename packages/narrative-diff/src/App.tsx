import { useEffect } from "react";
import { useViewerStore } from "@/store";
import { useNarrative } from "@/hooks/use-narrative";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { NavigationControls } from "@/components/NavigationControls/NavigationControls";
import { SectionFeed } from "@/components/SectionFeed/SectionFeed";
import { CrossLinkPanel } from "@/components/CrossLinkPanel/CrossLinkPanel";
import styles from "./App.module.css";

export function App() {
  const { sections, isLoading } = useNarrative();
  const activeCrossLinkSectionId = useViewerStore(
    (s) => s.activeCrossLinkSectionId,
  );
  const loadNarrative = useViewerStore((s) => s.loadNarrative);

  useKeyboardNavigation();

  useEffect(() => {
    if (sections.length > 0) {
      loadNarrative(sections);
    }
  }, [sections, loadNarrative]);

  if (isLoading) {
    return <div className={styles.loading}>Loading narrative...</div>;
  }

  return (
    <div className={styles.app}>
      <NavigationControls />
      <div
        className={`${styles.main} ${activeCrossLinkSectionId ? styles.twoColumn : ""}`}
      >
        <SectionFeed />
        {activeCrossLinkSectionId && <CrossLinkPanel />}
      </div>
    </div>
  );
}
