# weavy

Tools for text.

A collection of mostly independent projects focused around presentation and editing of text.

## Projects

### [toddler-proof-intellij](packages/toddler-proof-intellij/)

A JetBrains plugin that detects when keystrokes look like a toddler or pet mashing the keyboard and locks down the editor to protect your work, replacing it with a colorful interactive animation screen.

- **Detection engine**: Six weighted analyzers (keystroke rate, key simultaneity, character entropy, keyboard proximity, pattern shift from baseline, key-repeat ratio) combined via composite scoring with hysteresis
- **Lockdown UI**: Full-screen modal dialog with bouncing colorful shapes (Java2D) that respond to keypresses — fun for the toddler, safe for your code
- **Unlock**: Type "unlock" to return to editing (~1 in 309 million chance of random success)
- **Targets all JetBrains IDEs**: IntelliJ IDEA, WebStorm, PyCharm, GoLand, CLion, Rider, etc.

## Repository structure

```
weavy/
  packages/
    toddler-proof-intellij/     # JetBrains plugin (Kotlin/Gradle)
      detection-engine/          # Pure Kotlin detection library (no IDE deps)
      intellij-plugin/           # IntelliJ platform integration
```

## License

MIT
