package toddlerproof.detection

import toddlerproof.detection.analyzers.*

/**
 * Orchestrates all analyzers, computes a weighted composite score, and applies
 * hysteresis to produce stable mashing/not-mashing verdicts.
 */
class MashDetector(private val config: DetectorConfig = DetectorConfig()) {

    private val buffer = KeystrokeBuffer(config.bufferSize)

    private val analyzers: List<Pair<Analyzer, Double>> = listOf(
        RateAnalyzer() to config.rateWeight,
        SimultaneityAnalyzer(stuckKeyTimeoutMs = config.stuckKeyTimeoutMs) to config.simultaneityWeight,
        EntropyAnalyzer() to config.entropyWeight,
        ProximityAnalyzer() to config.proximityWeight,
        PatternShiftAnalyzer() to config.patternShiftWeight,
        RepeatAnalyzer() to config.repeatWeight,
    )

    enum class State { CALM, ELEVATED, TRIGGERED }

    private var state = State.CALM
    private var elevatedSince: Long = 0
    private var calmSince: Long = 0

    var onMashDetected: ((DetectionResult) -> Unit)? = null
    var onMashEnded: (() -> Unit)? = null
    var onScoreUpdate: ((DetectionResult) -> Unit)? = null

    fun feedEvent(event: KeystrokeEvent) {
        buffer.push(event)

        val breakdown = analyzers.map { (analyzer, _) -> analyzer.analyze(buffer) }
        val compositeScore = computeComposite(breakdown)
        val now = event.timestamp

        val result = DetectionResult(
            compositeScore = compositeScore,
            isMashing = state == State.TRIGGERED,
            breakdown = breakdown,
            timestamp = now,
        )

        // State machine with hysteresis
        when (state) {
            State.CALM -> {
                if (compositeScore >= config.triggerThreshold) {
                    state = State.ELEVATED
                    elevatedSince = now
                }
            }
            State.ELEVATED -> {
                if (compositeScore < config.triggerThreshold) {
                    // Dropped back below trigger — return to calm
                    state = State.CALM
                } else if (now - elevatedSince >= config.triggerSustainMs) {
                    // Sustained above threshold long enough — trigger lockdown
                    state = State.TRIGGERED
                    val triggeredResult = result.copy(isMashing = true)
                    onMashDetected?.invoke(triggeredResult)
                    onScoreUpdate?.invoke(triggeredResult)
                    return
                }
            }
            State.TRIGGERED -> {
                if (compositeScore < config.releaseThreshold) {
                    if (calmSince == 0L) calmSince = now
                    if (now - calmSince >= config.releaseSustainMs) {
                        state = State.CALM
                        calmSince = 0
                        onMashEnded?.invoke()
                    }
                } else {
                    calmSince = 0
                }
            }
        }

        onScoreUpdate?.invoke(result)
    }

    private fun computeComposite(breakdown: List<AnalyzerResult>): Double {
        var weightedSum = 0.0
        var totalWeight = 0.0

        for (i in breakdown.indices) {
            val (_, weight) = analyzers[i]
            val result = breakdown[i]
            val effectiveWeight = weight * result.confidence
            weightedSum += result.score * effectiveWeight
            totalWeight += effectiveWeight
        }

        return if (totalWeight > 0) weightedSum / totalWeight else 0.0
    }

    fun reset() {
        buffer.clear()
        state = State.CALM
        elevatedSince = 0
        calmSince = 0
        analyzers.forEach { (analyzer, _) -> analyzer.reset() }
    }

    fun currentState(): State = state
}
