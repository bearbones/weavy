package toddlerproof.intellij.service

import com.intellij.ide.IdeEventQueue
import com.intellij.openapi.Disposable
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.util.Disposer
import toddlerproof.detection.DetectorConfig
import toddlerproof.detection.MashDetector
import toddlerproof.intellij.listener.KeyEventAdapter
import toddlerproof.intellij.lockdown.LockdownManager
import toddlerproof.intellij.settings.ToddlerProofSettings

/**
 * Application-level service that owns the MashDetector, KeyEventAdapter,
 * and LockdownManager. Persists for the entire IDE lifecycle.
 */
@Service(Service.Level.APP)
class ToddlerDetectionService : Disposable {

    private val lockdownManager = LockdownManager()
    private var detector: MashDetector
    private var keyEventAdapter: KeyEventAdapter
    private var enabled: Boolean

    init {
        val settings = ToddlerProofSettings.getInstance().state
        enabled = settings.enabled

        val config = DetectorConfig(triggerThreshold = settings.sensitivity)
        detector = MashDetector(config)
        keyEventAdapter = KeyEventAdapter(detector)

        // Wire detection events to lockdown
        detector.onMashDetected = { result ->
            if (enabled) {
                keyEventAdapter.isLockdownActive = true
                lockdownManager.triggerLockdown(result)
            }
        }

        lockdownManager.onLockdownEnded = {
            keyEventAdapter.isLockdownActive = false
            detector.reset()
        }

        // Register the global event dispatcher
        IdeEventQueue.getInstance().addDispatcher(keyEventAdapter, this)
    }

    fun isEnabled(): Boolean = enabled

    fun setEnabled(value: Boolean) {
        enabled = value
        if (!value) {
            keyEventAdapter.isLockdownActive = false
            detector.reset()
        }
    }

    fun toggleEnabled() {
        setEnabled(!enabled)
    }

    override fun dispose() {
        keyEventAdapter.isLockdownActive = false
    }

    companion object {
        fun getInstance(): ToddlerDetectionService =
            ApplicationManager.getApplication().getService(ToddlerDetectionService::class.java)
    }
}
