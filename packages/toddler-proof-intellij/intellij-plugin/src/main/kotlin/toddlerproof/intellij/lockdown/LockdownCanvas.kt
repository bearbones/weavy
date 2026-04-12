package toddlerproof.intellij.lockdown

import java.awt.*
import java.awt.geom.Ellipse2D
import java.awt.geom.Path2D
import javax.swing.JPanel
import javax.swing.Timer
import kotlin.math.*
import kotlin.random.Random

/**
 * A colorful animated canvas that shows bouncing shapes.
 * Each keypress spawns a new shape, making it fun for a toddler to interact with
 * while the real editor is safely locked.
 */
class LockdownCanvas : JPanel() {

    private data class Shape(
        var x: Double,
        var y: Double,
        var vx: Double,
        var vy: Double,
        var size: Double,
        var color: Color,
        var type: ShapeType,
        var rotation: Double = Random.nextDouble() * Math.PI * 2,
        var rotationSpeed: Double = (Random.nextDouble() - 0.5) * 0.1,
        var opacity: Float = 1.0f,
        var age: Int = 0,
        val maxAge: Int = 600, // ~10 seconds at 60fps
    )

    enum class ShapeType { CIRCLE, STAR, HEART, SQUARE, TRIANGLE }

    private val shapes = mutableListOf<Shape>()
    private val maxShapes = 60

    private val colors = listOf(
        Color(255, 107, 107),  // Coral red
        Color(78, 205, 196),   // Teal
        Color(255, 230, 109),  // Sunny yellow
        Color(162, 155, 254),  // Lavender
        Color(0, 210, 211),    // Cyan
        Color(255, 159, 67),   // Orange
        Color(46, 213, 115),   // Green
        Color(255, 121, 198),  // Pink
        Color(116, 185, 255),  // Sky blue
        Color(253, 203, 110),  // Warm yellow
    )

    private val animationTimer: Timer

    init {
        isOpaque = true
        background = Color(30, 30, 50)

        animationTimer = Timer(16) { // ~60fps
            updateShapes()
            repaint()
        }
        animationTimer.start()

        // Spawn a few initial shapes
        repeat(5) { spawnShape() }
    }

    fun spawnShape() {
        if (shapes.size >= maxShapes) {
            // Remove oldest
            shapes.removeFirstOrNull()
        }
        val w = width.coerceAtLeast(400).toDouble()
        val h = height.coerceAtLeast(300).toDouble()
        shapes.add(Shape(
            x = Random.nextDouble() * w,
            y = Random.nextDouble() * h,
            vx = (Random.nextDouble() - 0.5) * 4,
            vy = (Random.nextDouble() - 0.5) * 4,
            size = 20.0 + Random.nextDouble() * 50,
            color = colors.random(),
            type = ShapeType.entries.random(),
        ))
    }

    private fun updateShapes() {
        val w = width.toDouble()
        val h = height.toDouble()
        if (w <= 0 || h <= 0) return

        val iter = shapes.iterator()
        while (iter.hasNext()) {
            val s = iter.next()
            s.x += s.vx
            s.y += s.vy
            s.rotation += s.rotationSpeed
            s.age++

            // Bounce off edges
            if (s.x - s.size / 2 < 0) { s.x = s.size / 2; s.vx = abs(s.vx) }
            if (s.x + s.size / 2 > w) { s.x = w - s.size / 2; s.vx = -abs(s.vx) }
            if (s.y - s.size / 2 < 0) { s.y = s.size / 2; s.vy = abs(s.vy) }
            if (s.y + s.size / 2 > h) { s.y = h - s.size / 2; s.vy = -abs(s.vy) }

            // Gentle gravity
            s.vy += 0.02

            // Fade out as it ages
            if (s.age > s.maxAge - 120) {
                s.opacity = ((s.maxAge - s.age) / 120.0f).coerceIn(0f, 1f)
            }
            if (s.age >= s.maxAge) {
                iter.remove()
            }
        }
    }

    override fun paintComponent(g: Graphics) {
        super.paintComponent(g)
        val g2 = g as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)

        // Background gradient
        val gradient = GradientPaint(0f, 0f, Color(30, 30, 50), 0f, height.toFloat(), Color(20, 20, 40))
        g2.paint = gradient
        g2.fillRect(0, 0, width, height)

        // Draw shapes
        for (shape in shapes) {
            val composite = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, shape.opacity)
            g2.composite = composite

            val transform = g2.transform
            g2.translate(shape.x, shape.y)
            g2.rotate(shape.rotation)

            g2.color = shape.color
            val half = shape.size / 2

            when (shape.type) {
                ShapeType.CIRCLE -> {
                    g2.fill(Ellipse2D.Double(-half, -half, shape.size, shape.size))
                }
                ShapeType.SQUARE -> {
                    g2.fillRoundRect(
                        (-half).toInt(), (-half).toInt(),
                        shape.size.toInt(), shape.size.toInt(), 8, 8
                    )
                }
                ShapeType.STAR -> drawStar(g2, half)
                ShapeType.HEART -> drawHeart(g2, half)
                ShapeType.TRIANGLE -> drawTriangle(g2, half)
            }

            g2.transform = transform
        }

        // Reset composite
        g2.composite = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1.0f)

        // Draw unlock hint (low contrast, bottom-right corner)
        g2.font = Font("SansSerif", Font.PLAIN, 13)
        g2.color = Color(60, 60, 80)
        val hint = "Type 'unlock' to return to editing"
        val fm = g2.fontMetrics
        g2.drawString(hint, width - fm.stringWidth(hint) - 20, height - 20)
    }

    private fun drawStar(g2: Graphics2D, radius: Double) {
        val path = Path2D.Double()
        val innerRadius = radius * 0.4
        for (i in 0 until 10) {
            val angle = Math.PI / 2 + i * Math.PI / 5
            val r = if (i % 2 == 0) radius else innerRadius
            val x = cos(angle) * r
            val y = -sin(angle) * r
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        path.closePath()
        g2.fill(path)
    }

    private fun drawHeart(g2: Graphics2D, size: Double) {
        val path = Path2D.Double()
        val s = size * 0.8
        path.moveTo(0.0, s * 0.3)
        path.curveTo(-s, -s * 0.3, -s * 0.3, -s, 0.0, -s * 0.4)
        path.curveTo(s * 0.3, -s, s, -s * 0.3, 0.0, s * 0.3)
        path.closePath()
        g2.fill(path)
    }

    private fun drawTriangle(g2: Graphics2D, size: Double) {
        val path = Path2D.Double()
        path.moveTo(0.0, -size)
        path.lineTo(size * 0.866, size * 0.5)
        path.lineTo(-size * 0.866, size * 0.5)
        path.closePath()
        g2.fill(path)
    }

    fun stopAnimation() {
        animationTimer.stop()
    }
}
