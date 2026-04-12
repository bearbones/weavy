package toddlerproof.detection

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MashDetectorTest {

    private fun press(
        keyCode: Int,
        keyChar: Char = keyCode.toChar(),
        timestamp: Long,
        isRepeat: Boolean = false,
    ) = KeystrokeEvent(keyCode, keyChar, timestamp, isPress = true, isRepeat = isRepeat)

    private fun release(keyCode: Int, keyChar: Char = keyCode.toChar(), timestamp: Long) =
        KeystrokeEvent(keyCode, keyChar, timestamp, isPress = false, isRepeat = false)

    @Test
    fun `normal typing does not trigger lockdown`() {
        val detector = MashDetector()
        var triggered = false
        detector.onMashDetected = { triggered = true }

        // Simulate typing "hello world" at ~8 chars/sec (normal speed)
        val text = "hello world"
        var time = 0L
        for (ch in text) {
            val code = ch.uppercaseChar().code
            detector.feedEvent(press(code, ch, time))
            time += 30
            detector.feedEvent(release(code, ch, time))
            time += 95 // ~125ms per keystroke = 8 keys/sec
        }

        assertFalse(triggered, "Normal typing should not trigger lockdown")
        assertEquals(MashDetector.State.CALM, detector.currentState())
    }

    @Test
    fun `fast typing does not trigger lockdown`() {
        val detector = MashDetector()
        var triggered = false
        detector.onMashDetected = { triggered = true }

        // Simulate fast typing at ~14 chars/sec (competitive typist)
        val text = "the quick brown fox jumps over"
        var time = 0L
        for (ch in text) {
            val code = ch.uppercaseChar().code
            detector.feedEvent(press(code, ch, time))
            time += 20
            detector.feedEvent(release(code, ch, time))
            time += 50 // ~70ms per keystroke = ~14 keys/sec
        }

        assertFalse(triggered, "Fast but normal typing should not trigger lockdown")
    }

    @Test
    fun `toddler palm smash triggers lockdown`() {
        // Real toddler mashing: fists/palms press multiple adjacent keys simultaneously,
        // rapidly, with key repeats from holding
        val config = DetectorConfig(triggerSustainMs = 100)
        val detector = MashDetector(config)
        var triggered = false
        detector.onMashDetected = { triggered = true }

        val clusterA = listOf(70, 71, 72, 74, 75) // F,G,H,J,K (adjacent)
        val clusterB = listOf(82, 84, 89, 85)      // R,T,Y,U (adjacent)
        var time = 0L

        // Multiple rounds of palm smashing — press several keys, hold, release, smash again
        for (round in 0 until 8) {
            val cluster = if (round % 2 == 0) clusterA else clusterB
            // Press all keys in cluster rapidly (5ms apart — fist hitting)
            for (code in cluster) {
                detector.feedEvent(press(code, code.toChar(), time, isRepeat = false))
                time += 5
            }
            // Hold them down — generates repeat events
            for (rep in 0 until 3) {
                time += 30
                for (code in cluster) {
                    detector.feedEvent(press(code, code.toChar(), time, isRepeat = true))
                    time += 3
                }
            }
            // Release all
            time += 10
            for (code in cluster) {
                detector.feedEvent(release(code, code.toChar(), time))
                time += 3
            }
            time += 20
        }

        assertTrue(triggered, "Toddler palm smash should trigger lockdown")
    }

    @Test
    fun `simultaneous key presses score high`() {
        val config = DetectorConfig(triggerSustainMs = 50)
        val detector = MashDetector(config)
        var triggered = false
        detector.onMashDetected = { triggered = true }

        // Simulate palm smash: press many keys at once without releasing
        var time = 0L
        val keys = listOf(70, 71, 72, 74, 75, 76, 85, 73) // F,G,H,J,K,L,U,I
        for (round in 0 until 10) {
            for (code in keys) {
                detector.feedEvent(press(code, code.toChar(), time, isRepeat = round > 0))
                time += 5
            }
            time += 20
            for (code in keys) {
                detector.feedEvent(release(code, code.toChar(), time))
                time += 5
            }
            time += 30
        }

        assertTrue(triggered, "Simultaneous key presses should trigger lockdown")
    }

    @Test
    fun `key holding with palm triggers lockdown`() {
        // Toddler holding fist on keyboard — multiple keys held simultaneously with repeats
        val config = DetectorConfig(triggerSustainMs = 50)
        val detector = MashDetector(config)
        var triggered = false
        detector.onMashDetected = { triggered = true }

        var time = 0L
        val keys = listOf(74, 75, 76, 72) // J,K,L,H — adjacent keys held by palm

        // Press all keys
        for (code in keys) {
            detector.feedEvent(press(code, code.toChar().lowercaseChar(), time))
            time += 5
        }

        // Hold them — generates repeat events for all held keys
        for (rep in 0 until 20) {
            time += 30
            for (code in keys) {
                detector.feedEvent(press(code, code.toChar().lowercaseChar(), time, isRepeat = true))
                time += 3
            }
        }

        // Release
        for (code in keys) {
            detector.feedEvent(release(code, code.toChar().lowercaseChar(), time))
            time += 5
        }

        assertTrue(triggered, "Holding multiple keys should trigger lockdown")
    }

    @Test
    fun `reset clears state`() {
        val detector = MashDetector()
        val code = 65
        detector.feedEvent(press(code, 'a', 0))
        detector.feedEvent(release(code, 'a', 50))

        detector.reset()
        assertEquals(MashDetector.State.CALM, detector.currentState())
    }
}
