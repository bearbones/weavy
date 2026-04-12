package toddlerproof.intellij.lockdown

import com.intellij.openapi.ui.DialogWrapper
import toddlerproof.intellij.settings.ToddlerProofSettings
import java.awt.Dimension
import java.awt.Toolkit
import javax.swing.Action
import javax.swing.JComponent

/**
 * A modal dialog that covers the IDE during lockdown.
 * Shows the colorful LockdownCanvas and listens for the unlock sequence.
 */
class LockdownDialog(
    private val onUnlocked: () -> Unit,
) : DialogWrapper(true) {

    private val canvas = LockdownCanvas()

    init {
        title = ""
        isModal = true
        init()

        val screenSize = Toolkit.getDefaultToolkit().screenSize
        setSize(screenSize.width, screenSize.height)
        setLocation(0, 0)
    }

    override fun createCenterPanel(): JComponent {
        val settings = ToddlerProofSettings.getInstance().state
        val unlockHandler = UnlockHandler(
            unlockWord = settings.unlockWord,
            onUnlocked = {
                canvas.stopAnimation()
                close(OK_EXIT_CODE)
                onUnlocked()
            },
            onKeyPress = { canvas.spawnShape() },
        )
        canvas.addKeyListener(unlockHandler)
        canvas.isFocusable = true
        canvas.preferredSize = Dimension(
            Toolkit.getDefaultToolkit().screenSize.width,
            Toolkit.getDefaultToolkit().screenSize.height,
        )
        return canvas
    }

    override fun createActions(): Array<Action> = emptyArray() // No OK/Cancel buttons

    override fun show() {
        super.show()
        canvas.requestFocusInWindow()
    }

    override fun doCancelAction() {
        // Prevent ESC from closing the dialog — toddler could hit ESC
    }
}
