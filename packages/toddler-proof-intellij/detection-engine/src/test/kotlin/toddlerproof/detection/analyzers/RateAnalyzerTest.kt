package toddlerproof.detection.analyzers

import toddlerproof.detection.KeystrokeBuffer
import toddlerproof.detection.KeystrokeEvent
import kotlin.test.Test
import kotlin.test.assertTrue

class RateAnalyzerTest {

    private fun press(keyCode: Int, timestamp: Long) =
        KeystrokeEvent(keyCode, keyCode.toChar(), timestamp, isPress = true)

    @Test
    fun `low rate scores near zero`() {
        val analyzer = RateAnalyzer()
        val buffer = KeystrokeBuffer()

        // 5 keys/sec — well below threshold
        for (i in 0 until 10) {
            buffer.push(press(65 + (i % 26), i * 200L))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score < 0.1, "Low typing rate should score near 0, got ${result.score}")
    }

    @Test
    fun `high rate scores near one`() {
        val analyzer = RateAnalyzer()
        val buffer = KeystrokeBuffer()

        // 30 keys/sec — well above threshold
        for (i in 0 until 30) {
            buffer.push(press(65 + (i % 26), i * 33L))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score > 0.8, "High typing rate should score near 1, got ${result.score}")
    }

    @Test
    fun `insufficient events yield zero confidence`() {
        val analyzer = RateAnalyzer()
        val buffer = KeystrokeBuffer()

        buffer.push(press(65, 0L))
        buffer.push(press(66, 100L))

        val result = analyzer.analyze(buffer)
        assertTrue(result.confidence < 0.5, "Too few events should have low confidence")
    }
}
