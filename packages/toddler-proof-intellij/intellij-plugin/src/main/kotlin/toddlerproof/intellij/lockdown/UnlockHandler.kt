package toddlerproof.intellij.lockdown

import java.awt.event.KeyEvent
import java.awt.event.KeyListener

/**
 * Watches keystrokes in the lockdown dialog for the unlock sequence.
 * Each correct letter in order advances the sequence; any wrong letter resets it.
 */
class UnlockHandler(
    private val unlockWord: String = "unlock",
    private val onUnlocked: () -> Unit,
    private val onProgress: (current: Int, total: Int) -> Unit = { _, _ -> },
    private val onKeyPress: () -> Unit = {},
) : KeyListener {

    private var sequenceIndex = 0

    override fun keyTyped(e: KeyEvent) {
        onKeyPress()

        val expected = unlockWord[sequenceIndex]
        if (e.keyChar == expected) {
            sequenceIndex++
            onProgress(sequenceIndex, unlockWord.length)
            if (sequenceIndex >= unlockWord.length) {
                sequenceIndex = 0
                onUnlocked()
            }
        } else {
            sequenceIndex = 0
            // Check if the wrong char is actually the first char of the sequence
            if (e.keyChar == unlockWord[0]) {
                sequenceIndex = 1
            }
            onProgress(sequenceIndex, unlockWord.length)
        }
    }

    override fun keyPressed(e: KeyEvent) {}
    override fun keyReleased(e: KeyEvent) {}

    fun reset() {
        sequenceIndex = 0
    }
}
