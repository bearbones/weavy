/**
 * Simple CODEOWNERS-style path matching.
 * Full CODEOWNERS parsing (with team resolution, precedence rules, etc.)
 * is deferred to Phase 2.
 */

/** Check if a file path matches an owner pattern. */
export function matchesOwner(
  _filePath: string,
  ownerPatterns: string[],
  targetOwner: string,
): boolean {
  // Phase 2: use filePath to match against CODEOWNERS glob patterns
  return ownerPatterns.some(
    (pattern) => pattern.toLowerCase() === targetOwner.toLowerCase(),
  );
}

/** Collect all unique owners from a list of owner arrays. */
export function collectOwners(ownerLists: string[][]): string[] {
  const set = new Set<string>();
  for (const owners of ownerLists) {
    for (const owner of owners) {
      set.add(owner);
    }
  }
  return [...set].sort();
}
