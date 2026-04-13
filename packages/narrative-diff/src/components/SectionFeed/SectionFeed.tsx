import { useRef, useCallback } from "react";
import { useViewerStore } from "@/store";
import { useSectionFocus } from "@/hooks/use-section-focus";
import { DiffSection } from "@/components/DiffSection/DiffSection";
import { Seam } from "@/components/Seam/Seam";
import styles from "./SectionFeed.module.css";

export function SectionFeed() {
  const sections = useViewerStore((s) => s.sections);
  const currentIndex = useViewerStore((s) => s.currentSectionIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map());

  const setRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) {
        sectionRefs.current.set(index, el);
      } else {
        sectionRefs.current.delete(index);
      }
    },
    [],
  );

  useSectionFocus(containerRef, sectionRefs);

  return (
    <div ref={containerRef} className={styles.feed}>
      {sections.map((section, index) => (
        <div key={section.id}>
          {index > 0 && <Seam />}
          <DiffSection
            ref={setRef(index)}
            section={section}
            index={index}
            focused={index === currentIndex}
          />
        </div>
      ))}
      {/* Bottom padding so the last section can scroll to center */}
      <div className={styles.bottomPad} />
    </div>
  );
}
