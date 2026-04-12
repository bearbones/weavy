plugins {
    kotlin("jvm") version "2.0.21"
}

group = "com.weavy.toddlerproof"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}
