import type { AnnotationSpec } from "./narrative-spec";
import type { DiffChunk, DiffFile } from "./diff";

/** A resolved section: narrative spec merged with actual diff data. */
export interface ResolvedSection {
  id: string;
  heading: string;
  rationale?: string;
  /** The diff chunks belonging to this section, grouped by file. */
  entries: SectionEntry[];
  /** IDs of other sections this one cross-links to. */
  crossLinks: string[];
  /** Annotations attached to lines in this section. */
  annotations: AnnotationSpec[];
  /** CODEOWNERS-style path patterns for owner filtering. */
  owners: string[];
}

/** A single file's contribution to a section. */
export interface SectionEntry {
  file: DiffFile;
  /** Subset of chunks from this file that belong to this section. */
  chunks: DiffChunk[];
}

/** Zustand store shape. */
export interface ViewerState {
  // --- Data ---
  sections: ResolvedSection[];

  // --- Navigation ---
  currentSectionIndex: number;

  // --- Section status ---
  viewedSectionIds: Set<string>;
  pinnedSectionIds: Set<string>;

  // --- Cross-link ---
  activeCrossLinkSectionId: string | null;

  // --- Owner filter ---
  activeOwnerFilter: string | null;

  // --- Actions ---
  goToSection: (index: number) => void;
  goToNextSection: () => void;
  goToPreviousSection: () => void;
  toggleViewed: (sectionId: string) => void;
  togglePinned: (sectionId: string) => void;
  openCrossLink: (sectionId: string) => void;
  closeCrossLink: () => void;
  setOwnerFilter: (owner: string | null) => void;
  loadNarrative: (sections: ResolvedSection[]) => void;
}
