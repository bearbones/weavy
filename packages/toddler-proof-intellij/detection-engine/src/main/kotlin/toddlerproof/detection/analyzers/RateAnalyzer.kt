package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer

/**
 * Detects abnormally high keystroke rate.
 * Normal fast typing: 8-12 keys/sec. Competitive: ~15/sec. Toddler mashing: 20-40+/sec.
 */
class RateAnalyzer(
    private val windowMs: Long = 2000,
    private val normalMaxRate: Double = 12.0,
    private val mashRate: Double = 25.0,
    private val minEvents: Int = 4,
) : Analyzer {

    override fun analyze(buffer: KeystrokeBuffer): AnalyzerResult {
        val presses = buffer.getPressesInWindow(windowMs)
        if (presses.size < minEvents) {
            return AnalyzerResult(score = 0.0, confidence = 0.0, signal = "rate")
        }

        val timeSpanMs = presses.last().timestamp - presses.first().timestamp
        if (timeSpanMs <= 0) {
            return AnalyzerResult(score = 1.0, confidence = 0.5, signal = "rate")
        }

        val rate = (presses.size - 1).toDouble() / (timeSpanMs / 1000.0)
        val score = ((rate - normalMaxRate) / (mashRate - normalMaxRate)).coerceIn(0.0, 1.0)
        val confidence = (presses.size.toDouble() / 10.0).coerceIn(0.0, 1.0)

        return AnalyzerResult(score = score, confidence = confidence, signal = "rate")
    }

    override fun reset() {}
}
