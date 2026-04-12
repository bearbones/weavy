package toddlerproof.intellij.listener

import com.intellij.ide.AppLifecycleListener
import toddlerproof.intellij.service.ToddlerDetectionService

/**
 * Forces the ToddlerDetectionService to initialize at IDE startup
 * so that keystroke monitoring begins immediately.
 */
class AppStartupListener : AppLifecycleListener {
    override fun appStarted() {
        // Accessing the service triggers its init block, which registers the event dispatcher
        ToddlerDetectionService.getInstance()
    }
}
