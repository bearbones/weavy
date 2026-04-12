package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Detects sudden divergence from the user's established typing baseline.
 * Maintains exponential moving averages of keystroke rate and compares recent
 * behavior against the baseline. This is critical for distinguishing "always fast"
 * typists from "suddenly chaotic" toddler input.
 */
class PatternShiftAnalyzer(
    private val recentWindowMs: Long = 2000,
    private val alpha: Double = 0.05, // EMA smoothing factor (slow adaptation)
    private val shiftThreshold: Double = 2.0, // std devs to score 0.0
    private val maxShift: Double = 5.0, // std devs to score 1.0
    private val minBaselineSamples: Int = 20,
) : Analyzer {

    private var baselineRate: Double = 0.0
    private var baselineRateVar: Double = 0.0 // variance
    private var sampleCount: Int = 0

    override fun analyze(buffer: KeystrokeBuffer): AnalyzerResult {
        val allPresses = buffer.getPresses()
        val recentPresses = buffer.getPressesInWindow(recentWindowMs)

        if (recentPresses.size < 4 || allPresses.size < minBaselineSamples) {
            // Not enough data — update baseline and return no signal
            updateBaseline(allPresses)
            return AnalyzerResult(score = 0.0, confidence = 0.0, signal = "pattern_shift")
        }

        // Current rate (keys/sec in recent window)
        val recentSpanMs = recentPresses.last().timestamp - recentPresses.first().timestamp
        val currentRate = if (recentSpanMs > 0) {
            (recentPresses.size - 1).toDouble() / (recentSpanMs / 1000.0)
        } else 20.0 // simultaneous = suspicious

        // How many standard deviations from baseline?
        val stdDev = sqrt(baselineRateVar).coerceAtLeast(0.5) // floor to avoid div by zero
        val zScore = abs(currentRate - baselineRate) / stdDev

        val score = ((zScore - shiftThreshold) / (maxShift - shiftThreshold))
            .coerceIn(0.0, 1.0)
        val confidence = (sampleCount.toDouble() / (minBaselineSamples * 2.0)).coerceIn(0.0, 1.0)

        // Only update baseline with non-suspicious data
        if (score < 0.3) {
            updateBaseline(allPresses)
        }

        return AnalyzerResult(score = score, confidence = confidence, signal = "pattern_shift")
    }

    private fun updateBaseline(presses: List<toddlerproof.detection.KeystrokeEvent>) {
        if (presses.size < 4) return

        // Compute rate over the full buffer
        val spanMs = presses.last().timestamp - presses.first().timestamp
        if (spanMs <= 0) return
        val rate = (presses.size - 1).toDouble() / (spanMs / 1000.0)

        if (sampleCount == 0) {
            baselineRate = rate
            baselineRateVar = 4.0 // initial variance guess
        } else {
            val diff = rate - baselineRate
            baselineRate += alpha * diff
            baselineRateVar += alpha * (diff * diff - baselineRateVar)
        }
        sampleCount++
    }

    override fun reset() {
        baselineRate = 0.0
        baselineRateVar = 0.0
        sampleCount = 0
    }
}
