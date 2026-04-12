package toddlerproof.intellij.listener

import toddlerproof.detection.KeystrokeEvent
import toddlerproof.detection.MashDetector
import java.awt.AWTEvent
import java.awt.event.KeyEvent
import com.intellij.ide.IdeEventQueue

/**
 * Intercepts all AWT KeyEvents globally via IdeEventQueue.
 * Converts them to detection-engine KeystrokeEvents and feeds the MashDetector.
 * When lockdown is active, consumes all keyboard events.
 */
class KeyEventAdapter(
    private val detector: MashDetector,
) : IdeEventQueue.EventDispatcher {

    @Volatile
    var isLockdownActive: Boolean = false

    // Track held keys to detect repeats (Java KeyEvent doesn't have isRepeat)
    private val heldKeys = mutableSetOf<Int>()

    override fun dispatch(e: AWTEvent): Boolean {
        if (e !is KeyEvent) return false

        when (e.id) {
            KeyEvent.KEY_PRESSED -> {
                val isRepeat = e.keyCode in heldKeys
                heldKeys.add(e.keyCode)

                val event = KeystrokeEvent(
                    keyCode = e.keyCode,
                    keyChar = e.keyChar,
                    timestamp = e.`when`,
                    isPress = true,
                    isRepeat = isRepeat,
                )
                detector.feedEvent(event)
            }
            KeyEvent.KEY_RELEASED -> {
                heldKeys.remove(e.keyCode)

                val event = KeystrokeEvent(
                    keyCode = e.keyCode,
                    keyChar = e.keyChar,
                    timestamp = e.`when`,
                    isPress = false,
                    isRepeat = false,
                )
                detector.feedEvent(event)
            }
        }

        // During lockdown, consume all keyboard events to prevent them reaching the IDE
        return isLockdownActive
    }
}
