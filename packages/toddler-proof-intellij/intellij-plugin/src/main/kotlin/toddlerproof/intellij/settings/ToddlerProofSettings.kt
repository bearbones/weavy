package toddlerproof.intellij.settings

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage

@Service(Service.Level.APP)
@State(name = "ToddlerProofSettings", storages = [Storage("toddler-proof.xml")])
class ToddlerProofSettings : PersistentStateComponent<ToddlerProofSettings.SettingsState> {

    data class SettingsState(
        var enabled: Boolean = true,
        var sensitivity: Double = 0.65,
        var unlockWord: String = "unlock",
    )

    private var state = SettingsState()

    override fun getState(): SettingsState = state

    override fun loadState(state: SettingsState) {
        this.state = state
    }

    companion object {
        fun getInstance(): ToddlerProofSettings =
            ApplicationManager.getApplication().getService(ToddlerProofSettings::class.java)
    }
}
