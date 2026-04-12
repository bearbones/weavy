package toddlerproof.detection.analyzers

import toddlerproof.detection.KeystrokeBuffer
import toddlerproof.detection.KeystrokeEvent
import kotlin.test.Test
import kotlin.test.assertTrue

class SimultaneityAnalyzerTest {

    private fun press(keyCode: Int, timestamp: Long) =
        KeystrokeEvent(keyCode, keyCode.toChar(), timestamp, isPress = true)

    private fun release(keyCode: Int, timestamp: Long) =
        KeystrokeEvent(keyCode, keyCode.toChar(), timestamp, isPress = false)

    @Test
    fun `normal typing with low concurrency scores near zero`() {
        val analyzer = SimultaneityAnalyzer()
        val buffer = KeystrokeBuffer()

        // Type normally: press, release, press, release (max 1 concurrent)
        for (i in 0 until 10) {
            buffer.push(press(65 + i, i * 120L))
            buffer.push(release(65 + i, i * 120L + 80))
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score < 0.1, "Normal typing should have low simultaneity score, got ${result.score}")
    }

    @Test
    fun `palm smash with high concurrency scores near one`() {
        val analyzer = SimultaneityAnalyzer()
        val buffer = KeystrokeBuffer()

        // Palm smash: press 7 keys without releasing
        var time = 0L
        for (i in 0 until 7) {
            buffer.push(press(70 + i, time))
            time += 5
        }
        // Then release them all
        for (i in 0 until 7) {
            buffer.push(release(70 + i, time))
            time += 5
        }

        val result = analyzer.analyze(buffer)
        assertTrue(result.score > 0.8, "7 concurrent keys should score high, got ${result.score}")
    }
}
