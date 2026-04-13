/** A narrative spec defines how a diff should be presented for review. */
export interface NarrativeSpec {
  /** Schema version for forward compatibility. */
  version: 1;
  /** Human-readable title for this narrative. */
  title: string;
  /** Optional description / PR summary. */
  description?: string;
  /** Ordered list of sections to present. */
  sections: NarrativeSectionSpec[];
}

/** One section of the narrative — a curated slice of the diff with context. */
export interface NarrativeSectionSpec {
  /** Unique identifier, used in cross-links. */
  id: string;
  /** Human-readable heading for this section. */
  heading: string;
  /** Optional prose explaining why this section matters. */
  rationale?: string;
  /** File globs or exact paths this section covers. */
  files: string[];
  /**
   * Optional line ranges within files. When specified, only diff lines
   * whose new-file line numbers fall within these ranges are included.
   * If omitted, the entire file diff is shown.
   */
  lineRanges?: LineRange[];
  /** IDs of other sections this section cross-links to. */
  crossLinks?: string[];
  /** Inline annotations attached to specific lines. */
  annotations?: AnnotationSpec[];
  /** CODEOWNERS-style path patterns. Used for "files owned by me" filtering. */
  owners?: string[];
}

export interface LineRange {
  /** File path this range applies to. */
  file: string;
  /** 1-based start line in the new file. */
  startLine: number;
  /** 1-based end line in the new file (inclusive). */
  endLine: number;
}

export interface AnnotationSpec {
  /** File path this annotation is attached to. */
  file: string;
  /** 1-based line number in the new file. */
  line: number;
  /** The annotation body (Markdown). */
  body: string;
  /** Optional severity/category. */
  kind?: "info" | "warning" | "question" | "suggestion";
}
