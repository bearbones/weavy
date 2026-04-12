package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer

/**
 * Detects tight clusters of adjacent keys (fist/palm mashing hits nearby keys).
 * Normal typing has varied distances. Mashing produces tight spatial clusters.
 */
class ProximityAnalyzer(
    private val windowMs: Long = 2000,
    private val closeDistance: Double = 1.5,
    private val normalCloseRatio: Double = 0.40,
    private val mashCloseRatio: Double = 0.75,
    private val minPairs: Int = 5,
) : Analyzer {

    override fun analyze(buffer: KeystrokeBuffer): AnalyzerResult {
        val presses = buffer.getPressesInWindow(windowMs)
        if (presses.size < minPairs + 1) {
            return AnalyzerResult(score = 0.0, confidence = 0.0, signal = "proximity")
        }

        var closePairs = 0
        var totalPairs = 0

        for (i in 0 until presses.size - 1) {
            val dist = KeyboardLayout.distance(presses[i].keyCode, presses[i + 1].keyCode)
            if (dist != null) {
                totalPairs++
                if (dist <= closeDistance) closePairs++
            }
        }

        if (totalPairs < minPairs) {
            return AnalyzerResult(score = 0.0, confidence = 0.3, signal = "proximity")
        }

        val closeRatio = closePairs.toDouble() / totalPairs
        val score = ((closeRatio - normalCloseRatio) / (mashCloseRatio - normalCloseRatio))
            .coerceIn(0.0, 1.0)
        val confidence = (totalPairs.toDouble() / 10.0).coerceIn(0.0, 1.0)

        return AnalyzerResult(score = score, confidence = confidence, signal = "proximity")
    }

    override fun reset() {}
}
