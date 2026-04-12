package toddlerproof.detection

data class KeystrokeEvent(
    val keyCode: Int,
    val keyChar: Char,
    val timestamp: Long,
    val isPress: Boolean,
    val isRepeat: Boolean = false,
)
