package toddlerproof.detection.analyzers

import kotlin.math.sqrt

/**
 * Maps physical key codes (java.awt.event.KeyEvent VK_ codes) to (row, col) positions
 * on a standard QWERTY keyboard for proximity analysis.
 */
object KeyboardLayout {
    // Position as (row, column) where row 0 = number row, column in approximate key units
    private val KEY_POSITIONS: Map<Int, Pair<Double, Double>> = buildMap {
        // Number row (row 0) — VK_0..VK_9 = 48..57
        put(49, 0.0 to 1.0)  // 1
        put(50, 0.0 to 2.0)  // 2
        put(51, 0.0 to 3.0)  // 3
        put(52, 0.0 to 4.0)  // 4
        put(53, 0.0 to 5.0)  // 5
        put(54, 0.0 to 6.0)  // 6
        put(55, 0.0 to 7.0)  // 7
        put(56, 0.0 to 8.0)  // 8
        put(57, 0.0 to 9.0)  // 9
        put(48, 0.0 to 10.0) // 0

        // QWERTY row (row 1) — VK_Q=81, W=87, E=69, R=82, T=84, Y=89, U=85, I=73, O=79, P=80
        put(81, 1.0 to 1.0)   // Q
        put(87, 1.0 to 2.0)   // W
        put(69, 1.0 to 3.0)   // E
        put(82, 1.0 to 4.0)   // R
        put(84, 1.0 to 5.0)   // T
        put(89, 1.0 to 6.0)   // Y
        put(85, 1.0 to 7.0)   // U
        put(73, 1.0 to 8.0)   // I
        put(79, 1.0 to 9.0)   // O
        put(80, 1.0 to 10.0)  // P

        // Home row (row 2) — A=65, S=83, D=68, F=70, G=71, H=72, J=74, K=75, L=76
        put(65, 2.0 to 1.5)   // A
        put(83, 2.0 to 2.5)   // S
        put(68, 2.0 to 3.5)   // D
        put(70, 2.0 to 4.5)   // F
        put(71, 2.0 to 5.5)   // G
        put(72, 2.0 to 6.5)   // H
        put(74, 2.0 to 7.5)   // J
        put(75, 2.0 to 8.5)   // K
        put(76, 2.0 to 9.5)   // L

        // Bottom row (row 3) — Z=90, X=88, C=67, V=86, B=66, N=78, M=77
        put(90, 3.0 to 2.0)   // Z
        put(88, 3.0 to 3.0)   // X
        put(67, 3.0 to 4.0)   // C
        put(86, 3.0 to 5.0)   // V
        put(66, 3.0 to 6.0)   // B
        put(78, 3.0 to 7.0)   // N
        put(77, 3.0 to 8.0)   // M

        // Space bar (row 4)
        put(32, 4.0 to 5.5)   // Space
    }

    fun getPosition(keyCode: Int): Pair<Double, Double>? = KEY_POSITIONS[keyCode]

    fun distance(keyCode1: Int, keyCode2: Int): Double? {
        val p1 = getPosition(keyCode1) ?: return null
        val p2 = getPosition(keyCode2) ?: return null
        val dr = p1.first - p2.first
        val dc = p1.second - p2.second
        return sqrt(dr * dr + dc * dc)
    }
}
