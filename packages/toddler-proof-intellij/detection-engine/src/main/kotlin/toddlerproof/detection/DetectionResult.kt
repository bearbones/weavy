package toddlerproof.detection

data class AnalyzerResult(
    val score: Double,
    val confidence: Double,
    val signal: String,
)

data class DetectionResult(
    val compositeScore: Double,
    val isMashing: Boolean,
    val breakdown: List<AnalyzerResult>,
    val timestamp: Long,
)
