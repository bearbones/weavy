# Narrative Diff

A modern, opinionated diff viewer that presents code changes in **narrative order** — the order that supports understanding — rather than the default file-tree alphabetical order.

## The problem

Standard diff viewers (GitHub, GitLab, etc.) show changed files in alphabetical order. This rarely matches the order a reviewer needs to understand the change. Related pieces — the cause and effect of a decision, the documentation and implementation, the type definitions and their usages — end up scattered across the file list. Reviewers are left to mentally reassemble the narrative themselves.

## The approach

Narrative Diff uses a **narrative spec** — a small JSON configuration that describes the order, grouping, and annotations for a diff. The spec can be authored by a human, an LLM agent, or generated with the help of static analysis tools. It defines:

- **Sections**: ordered groups of diff chunks, each with a heading and optional rationale
- **Cross-links**: wiki-style connections between related sections
- **Annotations**: inline commentary attached to specific lines (like review comments, but authored alongside the narrative)
- **Owner filtering**: CODEOWNERS-style patterns so reviewers can filter to "files owned by me"

## UX model

The viewer presents sections in a **feed-style layout**, similar to scrolling through a social media feed but more guided:

- Each section is a card showing its heading, file context, and diff content
- Sections are separated by visual **seams**
- The **current section** is highlighted at full opacity; surrounding sections are dimmed
- **Annotations** appear only when their section is focused
- **Navigation**: click next/previous buttons, press `j`/`k` hotkeys, or scroll
- Sections can be **checked off** as viewed, or **pinned** for easy return
- **Cross-links** open the linked section in a second column for side-by-side reference

## Narrative spec format

Narrative specs are JSON files (`.narrative.json`) with this structure:

```json
{
  "version": 1,
  "title": "Add user authentication",
  "description": "Introduces user accounts, login, and RBAC.",
  "sections": [
    {
      "id": "overview",
      "heading": "Documentation: what this PR does",
      "rationale": "Start with the docs to understand the big picture.",
      "files": ["docs/auth.md"],
      "crossLinks": ["routes"],
      "annotations": [
        {
          "file": "docs/auth.md",
          "line": 16,
          "body": "Session expiry is hardcoded — consider making this configurable.",
          "kind": "suggestion"
        }
      ],
      "owners": ["@docs-team"]
    }
  ]
}
```

### Section fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique identifier, used in cross-links |
| `heading` | yes | Human-readable section title |
| `rationale` | no | Prose explaining why this section matters in context |
| `files` | yes | File paths or globs (`src/api/*`, `**/*.test.ts`) |
| `lineRanges` | no | Restrict to specific line ranges within files |
| `crossLinks` | no | IDs of related sections |
| `annotations` | no | Inline comments attached to specific lines |
| `owners` | no | CODEOWNERS-style patterns for "files owned by me" filtering |

### Annotation kinds

- `info` — neutral context or explanation
- `warning` — potential issue to watch for
- `question` — open question for the reviewer
- `suggestion` — proposed improvement

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `j` / `↓` | Next section |
| `k` / `↑` | Previous section |
| `v` | Toggle current section as viewed |
| `p` | Toggle pin on current section |
| `Esc` | Close cross-link panel |

## Development

```bash
cd packages/narrative-diff
npm install
npm run dev          # Start Vite dev server
npm run typecheck    # Type-check without emitting
npm run build        # Production build
```

## Tech stack

- **React 19** + **TypeScript** — component framework
- **Vite 6** — build tool and dev server
- **Zustand 5** — lightweight state management
- **parse-diff** — unified diff parsing
- **CSS Modules** — scoped component styles

## Status

Phase 1 scaffolding. The viewer loads sample fixture data and supports basic navigation, focus tracking, viewed/pinned status, annotations, and cross-links. Future phases will add syntax highlighting (Shiki), Markdown in annotations, file/URL input, localStorage persistence, and theming.

## License

MIT
