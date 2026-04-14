# CLAUDE.md — weavy repo root

## What this repo is

A collection of mostly independent text-related projects under `packages/`. Each project has its own build system and can be developed independently.

## Repository layout

```
packages/
  toddler-proof-intellij/   # JetBrains plugin — Kotlin/Gradle
    detection-engine/        # Pure Kotlin library, no IDE dependencies
    intellij-plugin/         # IntelliJ platform integration layer
  narrative-diff/            # Diff viewer web app — TypeScript/React/Vite
```

## Conventions

- Each project lives in its own directory under `packages/`.
- Each project has its own build tooling (Gradle for Kotlin/JVM, potentially Vite/npm for future web projects).
- The root `.gitignore` covers Node.js, Gradle, and Vite artifacts.
- License is MIT across the repo.

## Working with projects

Always `cd` into the specific project directory before running build commands. Each project is self-contained with its own `gradlew` or equivalent.

### toddler-proof-intellij

```bash
cd packages/toddler-proof-intellij
./gradlew :detection-engine:test        # Run detection engine unit tests
./gradlew :intellij-plugin:runIde       # Launch sandboxed IDE with the plugin
./gradlew :intellij-plugin:buildPlugin  # Build distributable plugin zip
```

### narrative-diff

```bash
cd packages/narrative-diff
npm run dev          # Start Vite dev server
npm run typecheck    # Type-check without emitting
npm run build        # Production build
```

## Tech stack notes

- **Kotlin 2.0.21**, **Java 21**, **Gradle 8.14.3**
- The `detection-engine` module is intentionally free of IntelliJ dependencies so it can be reused in other contexts (Chrome extension, web app, etc.)
- The `intellij-plugin` module uses `org.jetbrains.intellij` Gradle plugin v1.17.4 and targets IntelliJ Platform 2024.3+ (build 243+)

- **React 19**, **TypeScript 5.8**, **Vite 6**, **Zustand 5** (narrative-diff)

## Future directions

- **Web app (Phase 2)**: Port the detection engine to TypeScript and build a standalone Vite web app with an HTML Canvas lockdown screen. Would live at `packages/toddler-proof-web/`.
- **Chrome extension (Phase 3)**: Wrap the TypeScript detection engine in a Manifest V3 content script to protect all browser tabs.
- **Additional text tools**: The repo is designed to host multiple independent projects.
