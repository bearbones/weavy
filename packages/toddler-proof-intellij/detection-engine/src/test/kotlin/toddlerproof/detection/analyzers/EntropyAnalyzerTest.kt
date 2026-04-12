package toddlerproof.detection.analyzers

import toddlerproof.detection.KeystrokeBuffer
import toddlerproof.detection.KeystrokeEvent
import kotlin.test.Test
import kotlin.test.assertTrue

class EntropyAnalyzerTest {

    private fun press(keyChar: Char, timestamp: Long) =
        KeystrokeEvent(keyChar.uppercaseChar().code, keyChar, timestamp, isPress = true)

    @Test
    fun `normal english text scores low`() {
        val analyzer = EntropyAnalyzer()
        val buffer = KeystrokeBuffer()

        val text = "the quick brown fox"
        for ((i, ch) in text.withIndex()) {
            buffer.push(press(ch, i * 100L))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score < 0.5, "Normal English text should score low, got ${result.score}")
    }

    @Test
    fun `random characters score high`() {
        val analyzer = EntropyAnalyzer()
        val buffer = KeystrokeBuffer()

        // Random-looking keyboard mash
        val text = "qwjfkdlsapzmxncbvhgy"
        for ((i, ch) in text.withIndex()) {
            buffer.push(press(ch, i * 50L))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score >= 0.4, "Random characters should score higher, got ${result.score}")
    }
}
