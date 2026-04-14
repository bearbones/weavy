import { create } from "zustand";
import type { ViewerState, ResolvedSection } from "@/types/app-state";

export const useViewerStore = create<ViewerState>()((set, get) => ({
  // --- Data ---
  sections: [],

  // --- Navigation ---
  currentSectionIndex: 0,

  // --- Section status ---
  viewedSectionIds: new Set<string>(),
  pinnedSectionIds: new Set<string>(),

  // --- Cross-link ---
  activeCrossLinkSectionId: null,

  // --- Owner filter ---
  activeOwnerFilter: null,

  // --- Actions ---
  goToSection: (index: number) => {
    const { sections } = get();
    if (index >= 0 && index < sections.length) {
      set({ currentSectionIndex: index });
    }
  },

  goToNextSection: () => {
    const { currentSectionIndex, sections } = get();
    if (currentSectionIndex < sections.length - 1) {
      set({ currentSectionIndex: currentSectionIndex + 1 });
    }
  },

  goToPreviousSection: () => {
    const { currentSectionIndex } = get();
    if (currentSectionIndex > 0) {
      set({ currentSectionIndex: currentSectionIndex - 1 });
    }
  },

  toggleViewed: (sectionId: string) => {
    const { viewedSectionIds } = get();
    const next = new Set(viewedSectionIds);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    set({ viewedSectionIds: next });
  },

  togglePinned: (sectionId: string) => {
    const { pinnedSectionIds } = get();
    const next = new Set(pinnedSectionIds);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    set({ pinnedSectionIds: next });
  },

  openCrossLink: (sectionId: string) => {
    set({ activeCrossLinkSectionId: sectionId });
  },

  closeCrossLink: () => {
    set({ activeCrossLinkSectionId: null });
  },

  setOwnerFilter: (owner: string | null) => {
    set({ activeOwnerFilter: owner });
  },

  loadNarrative: (sections: ResolvedSection[]) => {
    set({
      sections,
      currentSectionIndex: 0,
      viewedSectionIds: new Set(),
      pinnedSectionIds: new Set(),
      activeCrossLinkSectionId: null,
      activeOwnerFilter: null,
    });
  },
}));
