package toddlerproof.intellij.action

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import toddlerproof.intellij.service.ToddlerDetectionService

class ToggleAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val service = ToddlerDetectionService.getInstance()
        service.toggleEnabled()
    }

    override fun update(e: AnActionEvent) {
        val service = ToddlerDetectionService.getInstance()
        e.presentation.text = if (service.isEnabled()) {
            "Disable Toddler-Proof Mode"
        } else {
            "Enable Toddler-Proof Mode"
        }
    }
}
