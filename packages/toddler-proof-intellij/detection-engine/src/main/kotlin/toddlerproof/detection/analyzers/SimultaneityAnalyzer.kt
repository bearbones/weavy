package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer

/**
 * Detects multiple keys held simultaneously (palm/fist smashing).
 * Normal typing: rarely >2-3 concurrent keys. Toddler palm: 5+ keys at once.
 */
class SimultaneityAnalyzer(
    private val windowMs: Long = 2000,
    private val normalPeak: Int = 3,
    private val mashPeak: Int = 6,
    private val stuckKeyTimeoutMs: Long = 5000,
) : Analyzer {

    override fun analyze(buffer: KeystrokeBuffer): AnalyzerResult {
        val events = buffer.getWindow(windowMs)
        if (events.isEmpty()) {
            return AnalyzerResult(score = 0.0, confidence = 0.0, signal = "simultaneity")
        }

        val heldKeys = mutableMapOf<Int, Long>() // keyCode -> pressTimestamp
        var peakConcurrent = 0
        val now = events.last().timestamp

        for (event in events) {
            if (event.isPress) {
                heldKeys[event.keyCode] = event.timestamp
            } else {
                heldKeys.remove(event.keyCode)
            }
            // Clean up stuck keys
            heldKeys.entries.removeAll { now - it.value > stuckKeyTimeoutMs }
            peakConcurrent = maxOf(peakConcurrent, heldKeys.size)
        }

        val score = ((peakConcurrent - normalPeak).toDouble() / (mashPeak - normalPeak))
            .coerceIn(0.0, 1.0)
        val confidence = if (events.size >= 6) 1.0 else events.size / 6.0

        return AnalyzerResult(score = score, confidence = confidence, signal = "simultaneity")
    }

    override fun reset() {}
}
