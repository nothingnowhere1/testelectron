// renderer.js
const { ipcRenderer } = require("electron")

// DOM elements
const enableKioskBtn = document.getElementById("enable-kiosk")
const disableKioskBtn = document.getElementById("disable-kiosk")
const modeStatus = document.getElementById("mode-status")

// Check initial kiosk mode status
async function checkKioskMode() {
    const isKioskMode = await ipcRenderer.invoke("get-kiosk-mode")
    updateUI(isKioskMode)
}

// Update UI based on kiosk mode status
function updateUI(isKioskMode) {
    if (isKioskMode) {
        modeStatus.textContent = "Kiosk Mode"
        modeStatus.style.color = "#e74c3c"
        enableKioskBtn.disabled = true
        disableKioskBtn.disabled = false
        document.body.classList.add("kiosk-mode")
        createFullscreenOverlay()
        setupWindowsKeyBlocker()
        setupEdgeBlockers()
    } else {
        modeStatus.textContent = "Normal"
        modeStatus.style.color = "#3498db"
        enableKioskBtn.disabled = false
        disableKioskBtn.disabled = true
        document.body.classList.remove("kiosk-mode")
        removeFullscreenOverlay()
        removeEdgeBlockers()
        
        // Complete restoration of Windows functionality
        ipcRenderer.send("complete-restoration")
    }
}

// Event listeners
enableKioskBtn.addEventListener("click", () => {
    ipcRenderer.send("toggle-kiosk-mode", true)
})

disableKioskBtn.addEventListener("click", () => {
    ipcRenderer.send("toggle-kiosk-mode", false)
})

// Listen for kiosk mode changes from main process
ipcRenderer.on("kiosk-mode-changed", (event, isKioskMode) => {
    updateUI(isKioskMode)
})

// Block context menu in kiosk mode
document.addEventListener("contextmenu", (e) => {
    if (document.body.classList.contains("kiosk-mode")) {
        e.preventDefault()
        return false
    }
})

// Block keyboard events in kiosk mode
document.addEventListener(
    "keydown",
    (e) => {
        if (document.body.classList.contains("kiosk-mode")) {
            e.preventDefault()
            return false
        }
    },
    true,
)

// Specifically target Windows key
document.addEventListener(
    "keyup",
    (e) => {
        if (document.body.classList.contains("kiosk-mode")) {
            // Key code 91 is left Windows key, 92 is right Windows key
            if (e.keyCode === 91 || e.keyCode === 92 || e.key === "Meta") {
                e.preventDefault()
                e.stopPropagation()
                console.log("Windows key blocked via keyup")
                return false
            }
        }
    },
    true,
)

document.addEventListener(
    "keydown",
    (e) => {
        if (document.body.classList.contains("kiosk-mode")) {
            // Key code 91 is left Windows key, 92 is right Windows key
            if (e.keyCode === 91 || e.keyCode === 92 || e.key === "Meta") {
                e.preventDefault()
                e.stopPropagation()
                console.log("Windows key blocked via keydown")
                return false
            }
        }
    },
    true,
)

// Create edge blocker elements to prevent taskbar access
function setupEdgeBlockers() {
    if (!document.body.classList.contains("kiosk-mode")) return

    // Create bottom edge blocker (for taskbar)
    const bottomBlocker = document.createElement("div")
    bottomBlocker.id = "bottom-edge-blocker"
    bottomBlocker.style.position = "fixed"
    bottomBlocker.style.bottom = "0"
    bottomBlocker.style.left = "0"
    bottomBlocker.style.width = "100%"
    bottomBlocker.style.height = "5px"
    bottomBlocker.style.zIndex = "10000"
    bottomBlocker.style.backgroundColor = "transparent"

    // Create bottom-left corner blocker (for Start menu)
    const cornerBlocker = document.createElement("div")
    cornerBlocker.id = "corner-edge-blocker"
    cornerBlocker.style.position = "fixed"
    cornerBlocker.style.bottom = "0"
    cornerBlocker.style.left = "0"
    cornerBlocker.style.width = "50px"
    cornerBlocker.style.height = "50px"
    cornerBlocker.style.zIndex = "10000"
    cornerBlocker.style.backgroundColor = "transparent"

    // Add event listeners to blockers
    ;[bottomBlocker, cornerBlocker].forEach((blocker) => {
        ;[
            "mousedown",
            "mouseup",
            "click",
            "dblclick",
            "contextmenu",
            "touchstart",
            "touchend",
            "touchmove",
            "wheel",
        ].forEach((eventType) => {
            blocker.addEventListener(
                eventType,
                (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log(`Blocked ${eventType} at edge`)
                    return false
                },
                true,
            )
        })

        document.body.appendChild(blocker)
    })
}

function removeEdgeBlockers() {
    const bottomBlocker = document.getElementById("bottom-edge-blocker")
    const cornerBlocker = document.getElementById("corner-edge-blocker")

    if (bottomBlocker) bottomBlocker.remove()
    if (cornerBlocker) cornerBlocker.remove()
}

// Block mouse events at screen edges to prevent taskbar access
document.addEventListener("mousemove", (e) => {
    if (document.body.classList.contains("kiosk-mode")) {
        const screenHeight = window.innerHeight
        const screenWidth = window.innerWidth

        // If mouse is at bottom of screen (where taskbar usually is)
        if (e.clientY >= screenHeight - 5) {
            // Move mouse away from edge
            const simulatedEvent = new MouseEvent("mousemove", {
                clientX: e.clientX,
                clientY: screenHeight - 50,
                bubbles: true,
            })
            document.dispatchEvent(simulatedEvent)
            console.log("Blocked bottom edge access")

            // Force focus back to window
            window.focus()
        }

        // If mouse is at bottom-left corner (where Start menu usually is)
        if (e.clientY >= screenHeight - 10 && e.clientX <= 10) {
            // Move mouse away from corner
            const simulatedEvent = new MouseEvent("mousemove", {
                clientX: 50,
                clientY: screenHeight - 50,
                bubbles: true,
            })
            document.dispatchEvent(simulatedEvent)
            console.log("Blocked corner access")

            // Force focus back to window
            window.focus()
        }
    }
})

// Prevent default behavior for touchpad gestures
document.addEventListener(
    "wheel",
    (e) => {
        if (document.body.classList.contains("kiosk-mode")) {
            e.preventDefault() // Prevent all wheel events in kiosk mode
            return false
        }
    },
    { passive: false },
)

// Add a fullscreen overlay to capture all events
function createFullscreenOverlay() {
    // Remove any existing overlay first
    removeFullscreenOverlay()

    if (document.body.classList.contains("kiosk-mode")) {
        const overlay = document.createElement("div")
        overlay.id = "kiosk-overlay"
        overlay.style.position = "fixed"
        overlay.style.top = "0"
        overlay.style.left = "0"
        overlay.style.width = "100vw"
        overlay.style.height = "calc(100vh - 5px)" // Leave bottom 5px for the edge blocker
        overlay.style.zIndex = "9999"
        overlay.style.pointerEvents = "none" // Allow clicks to pass through to content

        document.body.appendChild(overlay)
    }
}

function removeFullscreenOverlay() {
    const overlay = document.getElementById("kiosk-overlay")
    if (overlay) {
        overlay.remove()
    }
}

// Add an additional method to block Windows key using lower-level event handling
function setupWindowsKeyBlocker() {
    if (document.body.classList.contains("kiosk-mode")) {
        // This uses a more aggressive approach to block the Windows key
        window.addEventListener("blur", (e) => {
            if (document.body.classList.contains("kiosk-mode")) {
                // When window loses focus, quickly refocus it
                // This can help prevent taskbar access when Windows key is pressed
                setTimeout(() => {
                    window.focus()
                }, 10)
            }
        })

        // Keep focus on the window
        const focusInterval = setInterval(() => {
            if (document.body.classList.contains("kiosk-mode")) {
                window.focus()
            } else {
                clearInterval(focusInterval)
            }
        }, 100)
    }
}

// Initialize
checkKioskMode()
