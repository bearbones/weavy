package toddlerproof.detection

data class DetectorConfig(
    val bufferSize: Int = 200,
    val triggerThreshold: Double = 0.65,
    val releaseThreshold: Double = 0.30,
    val triggerSustainMs: Long = 500,
    val releaseSustainMs: Long = 2000,
    val stuckKeyTimeoutMs: Long = 5000,

    val rateWeight: Double = 0.20,
    val simultaneityWeight: Double = 0.25,
    val entropyWeight: Double = 0.15,
    val proximityWeight: Double = 0.10,
    val patternShiftWeight: Double = 0.20,
    val repeatWeight: Double = 0.10,
)
