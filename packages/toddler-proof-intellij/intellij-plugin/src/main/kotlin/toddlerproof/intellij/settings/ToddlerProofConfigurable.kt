package toddlerproof.intellij.settings

import com.intellij.openapi.options.Configurable
import javax.swing.*
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.Insets

class ToddlerProofConfigurable : Configurable {

    private var enabledCheckbox: JCheckBox? = null
    private var sensitivitySlider: JSlider? = null
    private var unlockWordField: JTextField? = null

    override fun getDisplayName(): String = "Toddler-Proof Editor"

    override fun createComponent(): JComponent {
        val panel = JPanel(GridBagLayout())
        val gbc = GridBagConstraints().apply {
            fill = GridBagConstraints.HORIZONTAL
            insets = Insets(5, 5, 5, 5)
            anchor = GridBagConstraints.WEST
        }

        val settings = ToddlerProofSettings.getInstance().state

        // Enabled checkbox
        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2
        enabledCheckbox = JCheckBox("Enable toddler detection", settings.enabled)
        panel.add(enabledCheckbox, gbc)

        // Sensitivity slider
        gbc.gridx = 0; gbc.gridy = 1; gbc.gridwidth = 1
        panel.add(JLabel("Sensitivity:"), gbc)
        gbc.gridx = 1; gbc.weightx = 1.0
        sensitivitySlider = JSlider(30, 90, (settings.sensitivity * 100).toInt()).apply {
            majorTickSpacing = 15
            minorTickSpacing = 5
            paintTicks = true
            paintLabels = true
            val labels = java.util.Hashtable<Int, JLabel>()
            labels[30] = JLabel("Low")
            labels[60] = JLabel("Medium")
            labels[90] = JLabel("High")
            labelTable = labels
        }
        panel.add(sensitivitySlider, gbc)

        // Unlock word
        gbc.gridx = 0; gbc.gridy = 2; gbc.weightx = 0.0
        panel.add(JLabel("Unlock word:"), gbc)
        gbc.gridx = 1; gbc.weightx = 1.0
        unlockWordField = JTextField(settings.unlockWord, 15)
        panel.add(unlockWordField, gbc)

        // Spacer
        gbc.gridx = 0; gbc.gridy = 3; gbc.weighty = 1.0; gbc.gridwidth = 2
        panel.add(JPanel(), gbc)

        return panel
    }

    override fun isModified(): Boolean {
        val settings = ToddlerProofSettings.getInstance().state
        return enabledCheckbox?.isSelected != settings.enabled ||
            sensitivitySlider?.value != (settings.sensitivity * 100).toInt() ||
            unlockWordField?.text != settings.unlockWord
    }

    override fun apply() {
        val settings = ToddlerProofSettings.getInstance()
        settings.loadState(ToddlerProofSettings.SettingsState(
            enabled = enabledCheckbox?.isSelected ?: true,
            sensitivity = (sensitivitySlider?.value ?: 65) / 100.0,
            unlockWord = unlockWordField?.text ?: "unlock",
        ))
    }

    override fun reset() {
        val settings = ToddlerProofSettings.getInstance().state
        enabledCheckbox?.isSelected = settings.enabled
        sensitivitySlider?.value = (settings.sensitivity * 100).toInt()
        unlockWordField?.text = settings.unlockWord
    }

    override fun disposeUIResources() {
        enabledCheckbox = null
        sensitivitySlider = null
        unlockWordField = null
    }
}
