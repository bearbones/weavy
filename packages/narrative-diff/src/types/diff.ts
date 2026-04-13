/** Our internal representation of a parsed unified diff. */
export interface ParsedDiff {
  files: DiffFile[];
}

export interface DiffFile {
  /** Path before rename, or same as newPath. */
  oldPath: string;
  /** Path after rename, or same as oldPath. */
  newPath: string;
  /** Whether this is an addition, deletion, rename, or modification. */
  status: "added" | "deleted" | "renamed" | "modified";
  chunks: DiffChunk[];
}

export interface DiffChunk {
  /** Content of the chunk header (e.g., "@@ -10,5 +10,7 @@ function foo()"). */
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  changes: DiffLine[];
}

export interface DiffLine {
  type: "add" | "delete" | "context";
  /** 1-based line number in the old file (undefined for additions). */
  oldLineNumber?: number;
  /** 1-based line number in the new file (undefined for deletions). */
  newLineNumber?: number;
  /** The line content (without the leading +/-/space). */
  content: string;
}
