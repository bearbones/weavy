import parseDiff from "parse-diff";
import type { ParsedDiff, DiffFile, DiffChunk, DiffLine } from "@/types/diff";

/** Parse a unified diff string into our internal representation. */
export function parseUnifiedDiff(raw: string): ParsedDiff {
  const parsed = parseDiff(raw);
  return {
    files: parsed.map(mapFile),
  };
}

function mapFile(file: parseDiff.File): DiffFile {
  const oldPath = file.from ?? "/dev/null";
  const newPath = file.to ?? "/dev/null";

  let status: DiffFile["status"];
  if (file.new) {
    status = "added";
  } else if (file.deleted) {
    status = "deleted";
  } else if (oldPath !== newPath) {
    status = "renamed";
  } else {
    status = "modified";
  }

  return {
    oldPath,
    newPath,
    status,
    chunks: file.chunks.map(mapChunk),
  };
}

function mapChunk(chunk: parseDiff.Chunk): DiffChunk {
  return {
    header: chunk.content,
    oldStart: chunk.oldStart,
    oldLines: chunk.oldLines,
    newStart: chunk.newStart,
    newLines: chunk.newLines,
    changes: chunk.changes.map(mapChange),
  };
}

function mapChange(change: parseDiff.Change): DiffLine {
  switch (change.type) {
    case "add":
      return {
        type: "add",
        newLineNumber: change.ln,
        content: change.content.slice(1), // strip leading '+'
      };
    case "del":
      return {
        type: "delete",
        oldLineNumber: change.ln,
        content: change.content.slice(1), // strip leading '-'
      };
    case "normal":
      return {
        type: "context",
        oldLineNumber: change.ln1,
        newLineNumber: change.ln2,
        content: change.content.slice(1), // strip leading ' '
      };
  }
}
