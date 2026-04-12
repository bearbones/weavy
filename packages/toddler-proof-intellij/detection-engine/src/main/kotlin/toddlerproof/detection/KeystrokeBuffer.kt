package toddlerproof.detection

class KeystrokeBuffer(private val capacity: Int = 200) {
    private val buffer = arrayOfNulls<KeystrokeEvent>(capacity)
    private var head = 0
    private var size = 0

    fun push(event: KeystrokeEvent) {
        buffer[head] = event
        head = (head + 1) % capacity
        if (size < capacity) size++
    }

    fun getAll(): List<KeystrokeEvent> {
        if (size == 0) return emptyList()
        val result = ArrayList<KeystrokeEvent>(size)
        val start = if (size < capacity) 0 else head
        for (i in 0 until size) {
            val idx = (start + i) % capacity
            result.add(buffer[idx]!!)
        }
        return result
    }

    fun getWindow(durationMs: Long): List<KeystrokeEvent> {
        if (size == 0) return emptyList()
        val all = getAll()
        val cutoff = all.last().timestamp - durationMs
        return all.filter { it.timestamp >= cutoff }
    }

    fun getPresses(): List<KeystrokeEvent> = getAll().filter { it.isPress }

    fun getPressesInWindow(durationMs: Long): List<KeystrokeEvent> =
        getWindow(durationMs).filter { it.isPress }

    fun clear() {
        head = 0
        size = 0
    }

    fun currentSize(): Int = size
}
