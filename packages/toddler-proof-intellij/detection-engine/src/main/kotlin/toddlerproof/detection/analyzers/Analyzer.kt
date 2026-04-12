package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer

interface Analyzer {
    fun analyze(buffer: KeystrokeBuffer): AnalyzerResult
    fun reset()
}
