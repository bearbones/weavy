package toddlerproof.intellij.lockdown

import com.intellij.openapi.application.ApplicationManager
import toddlerproof.detection.DetectionResult

/**
 * Orchestrates the lockdown sequence:
 * 1. Protect editors (save, snapshot, read-only)
 * 2. Show the lockdown dialog
 * 3. On unlock, restore editors
 */
class LockdownManager {

    private val editorProtector = EditorProtector()

    @Volatile
    var isLocked: Boolean = false
        private set

    var onLockdownStarted: (() -> Unit)? = null
    var onLockdownEnded: (() -> Unit)? = null

    fun triggerLockdown(result: DetectionResult) {
        if (isLocked) return
        isLocked = true
        onLockdownStarted?.invoke()

        ApplicationManager.getApplication().invokeLater {
            // Protect all editors
            editorProtector.protect()

            // Show the lockdown dialog
            val dialog = LockdownDialog(
                onUnlocked = { unlock() }
            )
            dialog.show()
        }
    }

    private fun unlock() {
        if (!isLocked) return

        // Restore all editors
        editorProtector.restore()

        isLocked = false
        onLockdownEnded?.invoke()
    }
}
