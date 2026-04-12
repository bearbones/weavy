package toddlerproof.detection.analyzers

import toddlerproof.detection.KeystrokeBuffer
import toddlerproof.detection.KeystrokeEvent
import kotlin.test.Test
import kotlin.test.assertTrue

class RepeatAnalyzerTest {

    private fun press(keyCode: Int, timestamp: Long, isRepeat: Boolean = false) =
        KeystrokeEvent(keyCode, keyCode.toChar(), timestamp, isPress = true, isRepeat = isRepeat)

    @Test
    fun `no repeats scores zero`() {
        val analyzer = RepeatAnalyzer()
        val buffer = KeystrokeBuffer()

        for (i in 0 until 10) {
            buffer.push(press(65 + i, i * 100L))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score < 0.01, "No repeats should score ~0, got ${result.score}")
    }

    @Test
    fun `many repeats scores high`() {
        val analyzer = RepeatAnalyzer()
        val buffer = KeystrokeBuffer()

        // First press is not a repeat, subsequent ones are
        buffer.push(press(74, 0L, isRepeat = false))
        for (i in 1 until 20) {
            buffer.push(press(74, i * 30L, isRepeat = true))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score > 0.8, "High repeat ratio should score near 1, got ${result.score}")
    }
}
