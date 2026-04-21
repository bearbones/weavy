# forum-thread-editor

Authoring tool for fictional phpBB/vBulletin-style forum threads. Designed for producing portable bundles (`.zip` containing `project.json` + `assets/`) that games or other presentation layers can consume.

## Features

- Manage a roster of fictional users: name, avatar, tagline, signature, rank, join date, post count.
- Compose a thread: create posts as any user, reassign a post's author, edit body/timestamp, reorder, delete.
- Live preview in a classic phpBB two-column layout.
- BBCode subset that round-trips to Unity TextMeshPro and Roblox rich text: `[b] [i] [u] [s] [sub] [sup] [mark] [size=1..7] [color=...]`.
- Import/export portable ZIP bundles. Images are bundled as separate files; `project.json` references them by path.
- Auto-saves to localStorage as you work.

## Commands

```bash
npm install
npm run dev          # Vite dev server (http://localhost:5173)
npm run typecheck
npm run build        # to dist/
npm run preview
```

## Bundle format

```
your-thread.zip
  project.json       # ForumProject (schemaVersion: 1) with Asset.dataUrl stripped
  assets/
    <assetId>.png    # raw image bytes, referenced by filename in project.json
```

## License

MIT.
