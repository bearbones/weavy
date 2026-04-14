# CLAUDE.md — narrative-diff

## Project overview

A web-based diff viewer that presents code changes in narrative order. Takes a unified diff and a narrative spec (JSON) as input, and renders an interactive feed-style UI for code review.

## Build commands

```bash
cd packages/narrative-diff

npm run dev          # Start Vite dev server (http://localhost:5173)
npm run typecheck    # Type-check without emitting
npm run build        # Production build to dist/
npm run preview      # Serve production build locally
```

## Module structure

```
src/
  main.tsx                              # React entry point
  App.tsx                               # Root layout (nav + feed + optional cross-link column)
  App.module.css                        # Global CSS variables and layout

  types/
    narrative-spec.ts                   # NarrativeSpec, NarrativeSectionSpec, AnnotationSpec, LineRange
    diff.ts                             # ParsedDiff, DiffFile, DiffChunk, DiffLine
    app-state.ts                        # ResolvedSection, SectionEntry, ViewerState (store shape)

  parser/
    parse-unified-diff.ts               # Wraps parse-diff library -> our DiffFile types
    resolve-narrative.ts                # NarrativeSpec + ParsedDiff -> ResolvedSection[]
    index.ts                            # Re-exports

  store/
    viewer-store.ts                     # Zustand store: navigation, viewed/pinned, cross-links, owner filter
    index.ts

  components/
    DiffSection/DiffSection.tsx         # One narrative section: header + file entries + chunks + lines
    Seam/Seam.tsx                       # Visual separator between sections
    Annotation/Annotation.tsx           # Inline annotation badge (info/warning/question/suggestion)
    NavigationControls/NavigationControls.tsx  # Sticky top bar: prev/next, counter, progress
    SectionStatus/SectionStatus.tsx     # Viewed checkbox + pin toggle per section
    SectionFeed/SectionFeed.tsx         # Scrollable feed rendering all sections
    CrossLinkPanel/CrossLinkPanel.tsx   # Second column showing cross-linked section

  hooks/
    use-keyboard-navigation.ts          # j/k/v/p/Escape global bindings
    use-section-focus.ts                # Scroll-driven focus tracking (updates store.currentSectionIndex)
    use-narrative.ts                    # Loads fixtures, parses diff, resolves narrative

  fixtures/
    sample.diff                         # Multi-file unified diff (auth feature)
    sample.narrative.json               # Narrative spec for sample diff (6 sections)

  utils/
    codeowners.ts                       # Basic owner matching (stub — full CODEOWNERS parsing in Phase 2)
```

## Key design decisions

### Why narrative order instead of file order
The standard alphabetical file listing doesn't support understanding. A reviewer needs to see related pieces together — the type definition before the code that uses it, the migration before the ORM code, the docs before the implementation. The narrative spec lets a human or agent define the right order.

### Why a separate narrative spec (not embedded in the diff)
The narrative is an overlay on the diff, not a modification of it. This means:
- The same diff can have multiple narrative specs (different audiences, different focus areas)
- Specs can be generated, edited, and versioned independently
- Owner filtering works by filtering the spec's sections, not by modifying the diff

### Why Zustand over Context/Redux
The state shape is flat: one current index, two Sets (viewed/pinned IDs), one optional cross-link ID, one optional owner filter. Zustand's `getState()` lets the keyboard handler read state outside React, and selectors avoid re-renders in components that only care about one slice.

### Why parse-diff instead of diff2html
We own the rendering completely. diff2html produces its own HTML, which we'd have to fight or bypass. parse-diff gives us a clean JSON AST of the diff that we map to our own types.

### Why CSS Modules
Zero runtime, component-scoped names, native Vite support. The diff viewer needs very specific styling (line coloring, focus dimming, seam separators) that's better expressed as authored CSS than utility classes.

### Why scroll-position focus instead of IntersectionObserver
Simpler first pass. The focus model uses `requestAnimationFrame` on scroll to find the section whose top edge is closest to a "focus line" at 25% viewport height. Can upgrade to IntersectionObserver if performance requires it.

## Data flow

1. `use-narrative` hook loads `sample.diff` (raw string) and `sample.narrative.json`
2. `parseUnifiedDiff()` converts the raw diff string to `ParsedDiff` (our types)
3. `resolveNarrative()` merges the `NarrativeSpec` with `ParsedDiff` → `ResolvedSection[]`
4. `App` calls `loadNarrative(sections)` to populate the Zustand store
5. `SectionFeed` reads sections from the store and renders `DiffSection` components
6. `use-section-focus` updates `currentSectionIndex` on scroll
7. `use-keyboard-navigation` listens for j/k/v/p/Escape and calls store actions

## When modifying this project

- **Adding a new component**: Create a directory under `src/components/` with `.tsx` and `.module.css` files. Import into `SectionFeed` or `App` as needed.
- **Changing the narrative spec format**: Update `src/types/narrative-spec.ts` and `src/parser/resolve-narrative.ts`. Update `sample.narrative.json` to match.
- **Adding a new keyboard shortcut**: Edit `src/hooks/use-keyboard-navigation.ts`.
- **Changing the focus behavior**: Edit `src/hooks/use-section-focus.ts`.
- **Adding real data loading**: Modify `src/hooks/use-narrative.ts` to accept URL/file input.
- **Styling changes**: Each component's `.module.css` file is self-contained. Global CSS variables are in `App.module.css`.

## Dependencies

- **Runtime**: React 19, ReactDOM 19, Zustand 5, parse-diff
- **Build**: TypeScript 5.8, Vite 6, @vitejs/plugin-react
- **No linter configured yet** — add ESLint in Phase 2

## Phase 2 roadmap

- Syntax highlighting with Shiki
- Markdown rendering for annotation bodies
- Load diff/spec from URL, clipboard, or file picker
- Full CODEOWNERS file parsing
- localStorage persistence of viewed/pinned state
- Light/dark theme toggle
- Pinned sections sidebar
