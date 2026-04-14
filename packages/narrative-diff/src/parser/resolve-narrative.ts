import type { NarrativeSpec } from "@/types/narrative-spec";
import type { ParsedDiff, DiffFile, DiffChunk, DiffLine } from "@/types/diff";
import type { ResolvedSection, SectionEntry } from "@/types/app-state";

/**
 * Merge a narrative spec with a parsed diff to produce an ordered list of
 * resolved sections ready for rendering.
 */
export function resolveNarrative(
  spec: NarrativeSpec,
  diff: ParsedDiff,
): ResolvedSection[] {
  return spec.sections.map((section) => {
    const entries: SectionEntry[] = [];

    for (const pattern of section.files) {
      const matchingFiles = diff.files.filter((f) =>
        fileMatchesPattern(f, pattern),
      );

      for (const file of matchingFiles) {
        const lineRanges = section.lineRanges?.filter(
          (r) => r.file === file.newPath || r.file === file.oldPath,
        );

        if (lineRanges && lineRanges.length > 0) {
          // Slice chunks to only include lines within the specified ranges
          const slicedChunks = sliceChunksToRanges(file.chunks, lineRanges);
          if (slicedChunks.length > 0) {
            entries.push({ file, chunks: slicedChunks });
          }
        } else {
          // Include the entire file diff
          entries.push({ file, chunks: file.chunks });
        }
      }
    }

    return {
      id: section.id,
      heading: section.heading,
      rationale: section.rationale,
      entries,
      crossLinks: section.crossLinks ?? [],
      annotations: section.annotations ?? [],
      owners: section.owners ?? [],
    };
  });
}

/**
 * Check if a diff file matches a pattern. Supports:
 * - Exact path match
 * - Simple glob with trailing /* (matches directory)
 * - Simple glob with trailing /** (matches directory recursively)
 */
function fileMatchesPattern(file: DiffFile, pattern: string): boolean {
  const path = file.newPath !== "/dev/null" ? file.newPath : file.oldPath;

  // Exact match
  if (path === pattern) return true;

  // Strip leading slashes for comparison
  const normalizedPath = path.replace(/^\//, "");
  const normalizedPattern = pattern.replace(/^\//, "");

  if (normalizedPath === normalizedPattern) return true;

  // Directory glob: "src/components/*"
  if (normalizedPattern.endsWith("/*")) {
    const dir = normalizedPattern.slice(0, -2);
    const pathDir = normalizedPath.substring(
      0,
      normalizedPath.lastIndexOf("/"),
    );
    return pathDir === dir;
  }

  // Recursive directory glob: "src/components/**"
  if (normalizedPattern.endsWith("/**")) {
    const dir = normalizedPattern.slice(0, -3);
    return normalizedPath.startsWith(dir + "/");
  }

  // Filename glob: "*.ts" or "*.test.ts"
  if (normalizedPattern.startsWith("*")) {
    return normalizedPath.endsWith(normalizedPattern.slice(1));
  }

  return false;
}

/**
 * Filter and slice chunks to only include lines whose new-file line numbers
 * fall within the specified ranges.
 */
function sliceChunksToRanges(
  chunks: DiffChunk[],
  ranges: Array<{ startLine: number; endLine: number }>,
): DiffChunk[] {
  const result: DiffChunk[] = [];

  for (const chunk of chunks) {
    const filteredChanges = chunk.changes.filter((line) =>
      lineInRanges(line, ranges),
    );
    if (filteredChanges.length > 0) {
      result.push({ ...chunk, changes: filteredChanges });
    }
  }

  return result;
}

function lineInRanges(
  line: DiffLine,
  ranges: Array<{ startLine: number; endLine: number }>,
): boolean {
  // For additions and context lines, use the new-file line number.
  // For deletions, always include them if they're adjacent to an in-range line
  // (simplified: include if the chunk overlaps at all).
  const lineNum = line.newLineNumber ?? line.oldLineNumber;
  if (lineNum == null) return false;

  return ranges.some((r) => lineNum >= r.startLine && lineNum <= r.endLine);
}
