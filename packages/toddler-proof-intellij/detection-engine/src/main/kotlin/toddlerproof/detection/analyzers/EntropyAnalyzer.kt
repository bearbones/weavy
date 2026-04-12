package toddlerproof.detection.analyzers

import toddlerproof.detection.AnalyzerResult
import toddlerproof.detection.KeystrokeBuffer
import kotlin.math.ln
import kotlin.math.log2

/**
 * Detects random character distribution via Shannon entropy and common bigram absence.
 * Normal English text: ~3.5-4.5 bits entropy, frequent common bigrams.
 * Random mashing: ~5.5-6.0 bits entropy, almost no real bigrams.
 */
class EntropyAnalyzer(
    private val windowMs: Long = 3000,
    private val minChars: Int = 10,
    private val normalEntropy: Double = 4.5,
    private val mashEntropy: Double = 5.5,
) : Analyzer {

    companion object {
        val COMMON_BIGRAMS = setOf(
            "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd",
            "ti", "es", "or", "te", "of", "ed", "is", "it", "al", "ar",
            "st", "to", "nt", "ng", "se", "ha", "as", "ou", "io", "le",
            "ve", "co", "me", "de", "hi", "ri", "ro", "ic", "ne", "ea",
            "ra", "ce", "li", "ch", "ll", "be", "ma", "si", "om", "ur",
        )
    }

    override fun analyze(buffer: KeystrokeBuffer): AnalyzerResult {
        val presses = buffer.getPressesInWindow(windowMs)
        val chars = presses
            .filter { it.keyChar.isLetterOrDigit() || it.keyChar == ' ' }
            .map { it.keyChar.lowercaseChar() }

        if (chars.size < minChars) {
            return AnalyzerResult(score = 0.0, confidence = 0.0, signal = "entropy")
        }

        // Shannon entropy of character distribution
        val freq = mutableMapOf<Char, Int>()
        for (c in chars) freq[c] = (freq[c] ?: 0) + 1
        val total = chars.size.toDouble()
        var entropy = 0.0
        for ((_, count) in freq) {
            val p = count / total
            if (p > 0) entropy -= p * log2(p)
        }

        // Bigram hit rate
        val letters = chars.filter { it.isLetter() }
        var bigramHits = 0
        var bigramTotal = 0
        for (i in 0 until letters.size - 1) {
            val bigram = "${letters[i]}${letters[i + 1]}"
            bigramTotal++
            if (bigram in COMMON_BIGRAMS) bigramHits++
        }
        val bigramRate = if (bigramTotal > 0) bigramHits.toDouble() / bigramTotal else 0.0

        // Combine: high entropy + low bigram rate = mashing
        val entropyScore = ((entropy - normalEntropy) / (mashEntropy - normalEntropy))
            .coerceIn(0.0, 1.0)
        // Normal text has ~15-25% bigram hit rate; mashing has ~0-3%
        val bigramScore = (1.0 - (bigramRate / 0.15)).coerceIn(0.0, 1.0)
        val combinedScore = (entropyScore * 0.6 + bigramScore * 0.4)
        val confidence = (chars.size.toDouble() / 20.0).coerceIn(0.0, 1.0)

        return AnalyzerResult(score = combinedScore, confidence = confidence, signal = "entropy")
    }

    override fun reset() {}
}
