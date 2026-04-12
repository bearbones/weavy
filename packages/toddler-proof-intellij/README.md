# Toddler-Proof Editor — JetBrains Plugin

Detects when keystrokes look like a toddler or pet mashing the keyboard and locks down the IDE to protect your work, showing a colorful interactive animation screen instead.

## Quick start

```bash
./gradlew :detection-engine:test        # Run unit tests (15 tests)
./gradlew :intellij-plugin:runIde       # Launch sandboxed IDE with plugin installed
./gradlew :intellij-plugin:buildPlugin  # Build distributable plugin zip
```

## Architecture

This is a Gradle multi-module project with two modules:

### `detection-engine/` — Pure Kotlin library

Zero IntelliJ dependencies. Takes `KeystrokeEvent` objects as input, outputs `DetectionResult` with mashing/not-mashing verdicts.

**Core types:**
- `KeystrokeEvent` — timestamp, keyCode, keyChar, isPress, isRepeat
- `KeystrokeBuffer` — circular buffer of recent events (default capacity: 200)
- `MashDetector` — orchestrator that runs all analyzers and manages the hysteresis state machine
- `DetectorConfig` — all tunable thresholds, weights, and timing constants

**Six weighted analyzers**, each producing an independent 0.0–1.0 score with confidence:

| Analyzer | Weight | What it detects |
|----------|--------|-----------------|
| `RateAnalyzer` | 0.20 | Keystroke rate (keys/sec) over a 2-second window |
| `SimultaneityAnalyzer` | 0.25 | Peak number of keys held simultaneously |
| `EntropyAnalyzer` | 0.15 | Shannon entropy of character distribution + absence of common English bigrams |
| `ProximityAnalyzer` | 0.10 | Ratio of consecutive keypresses on adjacent QWERTY keys |
| `PatternShiftAnalyzer` | 0.20 | Sudden deviation from the user's learned typing baseline (EMA) |
| `RepeatAnalyzer` | 0.10 | Ratio of key-repeat events (from holding a key) |

**Composite scoring:** `sum(score * weight * confidence) / sum(weight * confidence)`

**Hysteresis state machine** (`CALM → ELEVATED → TRIGGERED`):
- Trigger: composite >= 0.65 sustained for 500ms
- Release: composite < 0.30 sustained for 2000ms

### `intellij-plugin/` — IntelliJ platform integration

**Key classes:**
- `ToddlerDetectionService` — application-level service owning the detector and event dispatcher; persists for the IDE's lifetime
- `KeyEventAdapter` — `IdeEventQueue.EventDispatcher` that converts AWT `KeyEvent` to `KeystrokeEvent` and feeds the detector; consumes all keyboard events during lockdown
- `EditorProtector` — saves all documents, snapshots text, sets documents read-only; restores on unlock
- `LockdownManager` — orchestrates the protect → dialog → unlock → restore sequence
- `LockdownDialog` — modal `DialogWrapper` covering the IDE; ESC is disabled
- `LockdownCanvas` — custom `JPanel` with Java2D rendering of bouncing colorful shapes (circles, stars, hearts, triangles); each keypress spawns a new shape
- `UnlockHandler` — `KeyListener` that watches for the unlock word typed in sequence
- `ToddlerProofSettings` — `PersistentStateComponent` storing enabled, sensitivity, unlock word
- `ToddlerProofConfigurable` — settings UI panel under Tools
- `ToggleAction` — `AnAction` to enable/disable detection

**Plugin compatibility:** Targets all JetBrains IDEs via `com.intellij.modules.platform` (IntelliJ, WebStorm, PyCharm, GoLand, CLion, Rider, etc.). Minimum build: 243 (2024.3).

## Configuration

Settings are under **Settings > Tools > Toddler-Proof Editor**:
- **Enable/disable** — toggle detection on or off
- **Sensitivity** — maps to `triggerThreshold` in `DetectorConfig` (range 0.30–0.90)
- **Unlock word** — the sequence to type to dismiss lockdown (default: "unlock")

## How it works end-to-end

1. `AppStartupListener.appStarted()` triggers `ToddlerDetectionService` initialization
2. The service registers `KeyEventAdapter` as a global `IdeEventQueue` dispatcher
3. Every AWT `KeyEvent` is converted to a `KeystrokeEvent` and fed to `MashDetector`
4. When the composite score stays above the trigger threshold for 500ms:
   - `EditorProtector.protect()` saves all docs, snapshots text, sets read-only
   - `LockdownDialog` opens as a modal covering the IDE
   - `KeyEventAdapter.isLockdownActive = true` — all further keyboard events are consumed
5. The `LockdownCanvas` renders animated shapes; each keypress spawns a new one
6. When the user types the unlock word in sequence:
   - `LockdownDialog` closes
   - `EditorProtector.restore()` reverts documents to their pre-lockdown state
   - The detector is reset to avoid immediate re-triggering

## Testing

```bash
./gradlew :detection-engine:test
```

Unit tests cover:
- Normal typing does not trigger (8 keys/sec, 14 keys/sec)
- Toddler palm smash triggers (simultaneous keys + repeats + adjacent clusters)
- Simultaneous key presses trigger
- Palm hold with repeats triggers
- Individual analyzer scoring (rate, simultaneity, entropy, repeat)
- Detector reset behavior

## Known limitations

- `ProximityAnalyzer` and `KeyboardLayout` assume a QWERTY physical layout
- `PatternShiftAnalyzer` needs ~20 keystrokes to build a baseline before it contributes to scoring
- The lockdown dialog does not prevent Alt-Tab to other OS applications (by design — the parent needs to reach the OS)
- Java `KeyEvent` does not have a native `isRepeat` field; `KeyEventAdapter` infers it by tracking held keys
