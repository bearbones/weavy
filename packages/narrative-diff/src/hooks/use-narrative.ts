import { useState, useEffect } from "react";
import { parseUnifiedDiff, resolveNarrative } from "@/parser";
import type { NarrativeSpec } from "@/types/narrative-spec";
import type { ResolvedSection } from "@/types/app-state";
import sampleDiff from "@/fixtures/sample.diff?raw";
import sampleSpec from "@/fixtures/sample.narrative.json";

/**
 * Hook that loads and resolves a narrative spec against a diff.
 * Currently hardcoded to the sample fixtures for development.
 * Future: accept URL/file input, support loading from clipboard, etc.
 */
export function useNarrative() {
  const [sections, setSections] = useState<ResolvedSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate async loading (in the future this will be a real fetch)
    const diff = parseUnifiedDiff(sampleDiff);
    const resolved = resolveNarrative(sampleSpec as NarrativeSpec, diff);
    setSections(resolved);
    setIsLoading(false);
  }, []);

  return { sections, isLoading };
}
