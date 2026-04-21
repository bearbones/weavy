# CLAUDE.md — forum-thread-editor

## Project overview

A web-based authoring tool for fictional forum threads. Produces portable, game-engine-friendly bundles (`.zip` containing `project.json` + `assets/`) intended for use in games or other presentation layers. Classic phpBB/vBulletin visual style.

## Build commands

```bash
cd packages/forum-thread-editor

npm run dev          # Vite dev server (http://localhost:5173)
npm run typecheck    # Type-check without emitting
npm run build        # Production build to dist/
npm run preview      # Serve production build locally
```

## Module structure

```
src/
  main.tsx                                  # React entry point
  App.tsx                                   # Shell: Toolbar + Thread/Users view switch
  App.module.css                            # Global CSS variables (phpBB tan palette)

  types/
    user.ts, post.ts, thread.ts             # Core entity types
    asset.ts                                # Asset + SerializedAsset (strips dataUrl)
    project.ts                              # ForumProject, SerializedForumProject, schemaVersion
    app-state.ts                            # EditorState (store shape)
    index.ts                                # Barrel

  store/
    editor-store.ts                         # Zustand store: CRUD, reorder, assets, IO
    index.ts

  components/
    Toolbar/                                # Sticky header: tabs, import/export, new user
    UsersView/, UserEditor/                 # User roster + modal editor
    ThreadView/                             # Title + ordered post feed + composer
    PostCard/                               # phpBB two-column layout (user col + body col)
    PostEditor/                             # Inline edit: author select, timestamp, BBCode
    NewPostComposer/                        # Author picker + BBCode textarea
    BBCodeRenderer/                         # <div dangerouslySetInnerHTML={renderBBCode}>
    BBCodeToolbar/                          # B/I/U/S/sub/sup/mark/color/size inserters

  hooks/
    use-local-storage-persistence.ts        # Hydrate + debounced auto-save
    use-project-io.ts                       # Import/export bundle

  utils/
    bbcode.ts                               # renderBBCode(source) → HTML
    bundle.ts                               # JSZip pack/unpack
    id.ts                                   # crypto.randomUUID wrapper
    download.ts                             # Blob download + slugify
    date.ts                                 # ISO/formatting helpers

  fixtures/
    sample-project.json                     # Seeds on first run
```

## Key design decisions

### BBCode subset = Unity TMP ∩ Roblox rich text

Only these tags are supported — everything else is left as literal text so the
author sees exactly what will survive export:

- `[b] [i] [u] [s] [sub] [sup] [mark]`
- `[size=1..7]` (maps to CSS class `bb-size-N` in preview; game engines scale by absolute size in their own way)
- `[color=#rgb|#rrggbb|name]` (whitelisted — junk values are dropped, not rendered)

Explicitly *not* supported: `[quote] [url] [img] [code]`. These don't cleanly
round-trip to Unity TMP / Roblox rich text, so we keep the set conservative.

The renderer HTML-escapes input first, then substitutes tags — this is what
makes `dangerouslySetInnerHTML` safe. Color values and size values are
whitelisted.

### Bundle format (portability is the product)

Export produces a single `.zip`:
```
project.json       # ForumProject with Asset.dataUrl stripped
assets/
  <assetId>.png    # or .jpg/.gif/.webp — raw bytes
```

Game engines can consume this: read `project.json`, load images by `assets/${asset.filename}`. The data URL of each asset only exists in memory; serialization strips it. Import reverses the process.

### State shape

Flat `ForumProject`:
- `users: Record<string, User>` — keyed by id
- `posts: Record<string, Post>` — keyed by id
- `assets: Record<string, Asset>` — keyed by id
- `thread: Thread` — single thread; `postIds` is the ordered list

Single-thread-per-project is MVP. Types allow extension to multi-thread.

### Why Zustand

Same reasoning as `narrative-diff`. Flat state, `getState()` usable from outside React (e.g. persistence hook's subscription), selectors avoid unnecessary rerenders.

### localStorage persistence

Key: `forum-thread-editor:project:v1`. Hydrates on mount; debounced 200ms write on project change via `useEditorStore.subscribe`. Data URLs are stored inline — fine for small fictional forums (~5MB quota). If we ever need more, IndexedDB is the upgrade path.

### Delete-user guard

Deleting a user who has authored any post is blocked (surfaces an error banner). Reassign their posts first — prevents orphan authorIds.

## Dependencies

- **Runtime**: React 19, ReactDOM 19, Zustand 5, JSZip 3
- **Build**: TypeScript 5.8, Vite 6, @vitejs/plugin-react

## Phase 2 ideas (not implemented)

- Multiple threads per project
- Inline images in post bodies (a new `[asset=id]` tag + asset picker)
- Drag-and-drop post reordering
- Undo/redo
- `[quote]` that renders to plain indentation in export
- IndexedDB persistence for larger libraries
- Schema migrations (only v1 today; `schemaVersion` field reserved for future)
