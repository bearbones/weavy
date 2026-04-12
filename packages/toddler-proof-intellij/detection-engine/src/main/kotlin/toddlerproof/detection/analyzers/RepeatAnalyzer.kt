package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer

/**
 * Detects excessive key-repeat events (from holding a key down).
 * Normal typing: essentially 0% repeats. Toddler holding key: 40%+ repeats.
 */
class RepeatAnalyzer(
    private val windowMs: Long = 2000,
    private val mashRepeatRatio: Double = 0.40,
    private val minEvents: Int = 6,
) : Analyzer {

    override fun analyze(buffer: KeystrokeBuffer): AnalyzerResult {
        val presses = buffer.getPressesInWindow(windowMs)
        if (presses.size < minEvents) {
            return AnalyzerResult(score = 0.0, confidence = 0.0, signal = "repeat")
        }

        val repeatCount = presses.count { it.isRepeat }
        val repeatRatio = repeatCount.toDouble() / presses.size

        val score = (repeatRatio / mashRepeatRatio).coerceIn(0.0, 1.0)
        val confidence = (presses.size.toDouble() / 12.0).coerceIn(0.0, 1.0)

        return AnalyzerResult(score = score, confidence = confidence, signal = "repeat")
    }

    override fun reset() {}
}
