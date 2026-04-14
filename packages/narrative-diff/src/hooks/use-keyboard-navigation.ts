import { useEffect } from "react";
import { useViewerStore } from "@/store";

/**
 * Global keyboard navigation for the narrative viewer.
 *
 * Bindings:
 * - j / ArrowDown — next section
 * - k / ArrowUp — previous section
 * - v — toggle current section as viewed
 * - p — toggle current section as pinned
 * - Escape — close cross-link panel
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const store = useViewerStore.getState();

      switch (e.key) {
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          store.goToNextSection();
          scrollToCurrentSection(store.currentSectionIndex + 1);
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          store.goToPreviousSection();
          scrollToCurrentSection(store.currentSectionIndex - 1);
          break;
        }
        case "v": {
          const section = store.sections[store.currentSectionIndex];
          if (section) {
            store.toggleViewed(section.id);
          }
          break;
        }
        case "p": {
          const section = store.sections[store.currentSectionIndex];
          if (section) {
            store.togglePinned(section.id);
          }
          break;
        }
        case "Escape": {
          if (store.activeCrossLinkSectionId) {
            store.closeCrossLink();
          }
          break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function scrollToCurrentSection(targetIndex: number) {
  // Allow the state update to propagate, then scroll
  requestAnimationFrame(() => {
    const el = document.querySelector(
      `[data-section-index="${targetIndex}"]`,
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
