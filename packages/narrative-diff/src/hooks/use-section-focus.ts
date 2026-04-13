import { useEffect, type RefObject } from "react";
import { useViewerStore } from "@/store";

/**
 * Scroll-driven focus tracking. Updates the current section index in the
 * store based on which section is closest to the top of the viewport.
 *
 * Uses a simple scroll-position approach: the section whose top edge is
 * closest to (but not below) the viewport's "focus line" (1/4 from top)
 * becomes current.
 */
export function useSectionFocus(
  _containerRef: RefObject<HTMLDivElement | null>,
  sectionRefs: RefObject<Map<number, HTMLElement>>,
) {
  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        const focusLine = window.innerHeight * 0.25;
        const refs = sectionRefs.current;
        if (!refs) return;

        let bestIndex = 0;
        let bestDistance = Infinity;

        refs.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          // Distance from section top to the focus line
          const distance = Math.abs(rect.top - focusLine);
          // Prefer sections whose top is at or above the focus line
          const adjustedDistance =
            rect.top <= focusLine + 50 ? distance : distance + 10000;

          if (adjustedDistance < bestDistance) {
            bestDistance = adjustedDistance;
            bestIndex = index;
          }
        });

        const currentIndex = useViewerStore.getState().currentSectionIndex;
        if (bestIndex !== currentIndex) {
          useViewerStore.getState().goToSection(bestIndex);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [_containerRef, sectionRefs]);
}
