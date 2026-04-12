# CLAUDE.md — toddler-proof-intellij

## Project overview

JetBrains plugin that detects toddler/pet keyboard mashing and locks down the IDE. Two Gradle modules: `detection-engine` (pure Kotlin) and `intellij-plugin` (IDE integration).

## Build commands

```bash
cd packages/toddler-proof-intellij

./gradlew :detection-engine:test          # Run detection engine unit tests (15 tests)
./gradlew :detection-engine:build         # Build the detection engine JAR
./gradlew :intellij-plugin:runIde         # Launch sandboxed IDE with plugin
./gradlew :intellij-plugin:buildPlugin    # Build distributable plugin zip
./gradlew :intellij-plugin:verifyPlugin   # Run JetBrains plugin compatibility checks
```

## Module structure

```
detection-engine/                          # Pure Kotlin — NO IntelliJ dependencies
  src/main/kotlin/toddlerproof/detection/
    KeystrokeEvent.kt                      # Input data class
    KeystrokeBuffer.kt                     # Circular buffer (capacity 200)
    DetectorConfig.kt                      # All tunable constants
    DetectionResult.kt                     # Output: score, isMashing, breakdown
    MashDetector.kt                        # Orchestrator + hysteresis state machine
    analyzers/
      Analyzer.kt                          # Interface: analyze(buffer) -> AnalyzerResult
      RateAnalyzer.kt                      # Keys/sec (weight 0.20)
      SimultaneityAnalyzer.kt              # Concurrent keys held (weight 0.25)
      EntropyAnalyzer.kt                   # Character entropy + bigrams (weight 0.15)
      ProximityAnalyzer.kt                 # Adjacent key clusters (weight 0.10)
      PatternShiftAnalyzer.kt              # Baseline deviation (weight 0.20)
      RepeatAnalyzer.kt                    # Key-hold repeats (weight 0.10)
      KeyboardLayout.kt                    # QWERTY (row, col) position map
  src/test/kotlin/toddlerproof/detection/
    MashDetectorTest.kt                    # Integration tests (6 tests)
    analyzers/
      RateAnalyzerTest.kt                  # 3 tests
      SimultaneityAnalyzerTest.kt          # 2 tests
      EntropyAnalyzerTest.kt              # 2 tests
      RepeatAnalyzerTest.kt               # 2 tests

intellij-plugin/                           # IntelliJ platform integration
  src/main/kotlin/toddlerproof/intellij/
    service/
      ToddlerDetectionService.kt           # App-level service, owns detector + dispatcher
    listener/
      AppStartupListener.kt               # Forces service init at IDE startup
      KeyEventAdapter.kt                  # IdeEventQueue.EventDispatcher -> KeystrokeEvent
    lockdown/
      LockdownManager.kt                  # Orchestrates protect -> dialog -> restore
      EditorProtector.kt                  # Save, snapshot, read-only, restore
      LockdownDialog.kt                   # Modal DialogWrapper, ESC disabled
      LockdownCanvas.kt                   # Java2D animated shapes (JPanel)
      UnlockHandler.kt                    # Watches for unlock word sequence
    action/
      ToggleAction.kt                     # Enable/disable detection
    settings/
      ToddlerProofSettings.kt            # PersistentStateComponent
      ToddlerProofConfigurable.kt        # Settings UI panel
  src/main/resources/META-INF/
    plugin.xml                            # Plugin descriptor
```

## Key design decisions

### Why a separate detection-engine module
The detection algorithm is pure Kotlin with no IntelliJ dependencies. This makes it:
- Fully unit-testable without an IDE
- Portable to other platforms (web app via Kotlin/JS, or rewritten in TypeScript)
- Fast to iterate on — `./gradlew :detection-engine:test` runs in seconds

### Why weighted composite scoring with hysteresis
No single signal reliably distinguishes toddler mashing from fast typing. The composite score requires multiple signals to be elevated simultaneously. Hysteresis (different trigger/release thresholds with sustain periods) prevents rapid toggling.

### Why IdeEventQueue.addDispatcher for detection
It receives ALL AWT events globally regardless of which component has focus. This is better than `TypedActionHandler` (characters only) or `EditorActionHandler` (editor-specific). During lockdown, returning `true` from the dispatcher consumes events before they reach anything.

### Why document snapshots instead of undo
Trying to undo toddler keystrokes is unreliable — the undo stack may contain interleaved IDE operations (auto-imports, formatting). Snapshotting the full document text when detection becomes suspicious is simpler and guaranteed correct.

## Tuning the detection algorithm

All thresholds are in `DetectorConfig.kt`. Key parameters to adjust:

- `triggerThreshold` (default 0.65): Lower = more sensitive, higher = fewer false positives
- `triggerSustainMs` (default 500): How long the score must stay above threshold before triggering
- Analyzer weights: Increase `simultaneityWeight` if palm smashes are the primary concern; increase `rateWeight` if rapid sequential mashing is more common
- Individual analyzer thresholds (e.g., `RateAnalyzer.normalMaxRate`, `SimultaneityAnalyzer.mashPeak`): These control where each analyzer's 0-to-1 ramp starts and ends

## When modifying this project

- **Adding a new analyzer**: Implement the `Analyzer` interface, add it to the `analyzers` list in `MashDetector.kt`, add a weight field to `DetectorConfig`, write unit tests
- **Changing the lockdown UI**: Edit `LockdownCanvas.kt` for the animation, `UnlockHandler.kt` for the unlock mechanism
- **Adding IDE-specific features**: Edit `plugin.xml` for extension points, add to the `intellij-plugin` module only
- **Testing locally**: `./gradlew :intellij-plugin:runIde` launches a sandboxed IntelliJ with the plugin. Mash the keyboard to trigger lockdown, type "unlock" to dismiss.

## Dependencies

- **Runtime**: Zero external dependencies. The detection engine uses only Kotlin stdlib. The plugin uses only IntelliJ Platform APIs.
- **Build**: Kotlin 2.0.21, Gradle 8.14.3, `org.jetbrains.intellij` plugin 1.17.4
- **Target**: IntelliJ Platform 2024.3+ (build 243+), all JetBrains IDEs
