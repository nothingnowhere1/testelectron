// main.js
const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require("electron")
const path = require("path")
const { enhanceWindowsKioskMode } = require("./kiosk-helper.js")

let mainWindow
let isKioskMode = false

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    mainWindow.loadFile("index.html")

    // Open DevTools in development
    if (process.env.NODE_ENV === "development") {
        mainWindow.webContents.openDevTools()
    }

    // Prevent new windows from being created
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: "deny" }
    })
}

// Enable kiosk mode
function enableKioskMode() {
    if (!mainWindow) return

    isKioskMode = true

    // Set window properties for kiosk mode
    mainWindow.setKiosk(true)

    // Set window bounds to cover the entire screen including taskbar
    const primaryDisplay = screen.getPrimaryDisplay()

    // Set window to cover entire screen including taskbar
    mainWindow.setPosition(0, 0)
    mainWindow.setSize(primaryDisplay.bounds.width, primaryDisplay.bounds.height)

    // Ensure window is above taskbar
    mainWindow.setAlwaysOnTop(true, "screen-saver")

    // Additional measures to prevent taskbar access
    mainWindow.setSkipTaskbar(true)
    mainWindow.setAutoHideMenuBar(true)

    // Platform-specific key blocking
    if (process.platform === "win32") {
        // Windows-specific key blocking
        try {
            // More aggressive Windows key blocking approach
            // Block the Windows key itself (both left and right)
            globalShortcut.register("Super", () => {
                console.log("Windows key (Super) blocked")
                return false
            })
            
            // Block left Windows key specifically
            globalShortcut.register("Super+L", () => {
                console.log("Left Windows key blocked")
                return false
            })
            
            // Block right Windows key specifically  
            globalShortcut.register("Super+R", () => {
                console.log("Right Windows key blocked")
                return false
            })
            
            // Block Windows key as "Meta" (some systems use this identifier)
            globalShortcut.register("Meta", () => {
                console.log("Windows key (Meta) blocked")
                return false
            })
            
            // Block LWin and RWin which are more specific identifiers
            globalShortcut.register("LWin", () => {
                console.log("LWin key blocked")
                return false
            })
            
            globalShortcut.register("RWin", () => {
                console.log("RWin key blocked")
                return false
            })

            // Block common Windows key combinations
            globalShortcut.register("CommandOrControl+Esc", () => false)
            globalShortcut.register("Meta+D", () => false) 
            globalShortcut.register("Meta+E", () => false)
            globalShortcut.register("Meta+R", () => false)
            globalShortcut.register("Meta+F", () => false)
            globalShortcut.register("Meta+Tab", () => false)
            
            // Block Super key combinations (alternative naming)
            globalShortcut.register("Super+D", () => false)
            globalShortcut.register("Super+E", () => false)
            globalShortcut.register("Super+F", () => false)
            globalShortcut.register("Super+Tab", () => false)
        } catch (error) {
            console.error("Failed to register Windows key blockers:", error)
        }
    } else if (process.platform === "darwin") {
        // macOS-specific key blocking
        try {
            globalShortcut.register("Command", () => {
                console.log("Command key blocked")
                return false
            })
        } catch (error) {
            console.error("Failed to register Command key blocker:", error)
        }
    }

    // Block additional touchpad/mouse related shortcuts
    try {
        globalShortcut.register("Alt+Esc", () => false)
        globalShortcut.register("Ctrl+Esc", () => false)
    } catch (error) {
        console.error("Failed to register Esc combinations:", error)
    }

    mainWindow.setClosable(false)
    mainWindow.setFullScreen(true)
    mainWindow.setMenuBarVisibility(false)

    // Register all common shortcuts to prevent them from working
    const shortcuts = ["Alt+F4", "Alt+Tab", "Ctrl+Esc", "Ctrl+Shift+Esc", "F11", "Esc", "Tab", "Ctrl+W", "Alt+Space"]

    // Block all function keys F1-F12
    for (let i = 1; i <= 12; i++) {
        try {
            globalShortcut.register(`F${i}`, () => {
                console.log(`F${i} is blocked in kiosk mode`)
                return false
            })
        } catch (error) {
            console.log(`Failed to register F${i}:`, error)
        }
    }

    // Block common shortcuts
    shortcuts.forEach((shortcut) => {
        try {
            globalShortcut.register(shortcut, () => {
                console.log(`${shortcut} is blocked in kiosk mode`)
                return false
            })
        } catch (error) {
            console.log(`Failed to register shortcut: ${shortcut}`, error)
        }
    })

    // Block all Alt combinations
    try {
        globalShortcut.register("Alt+F4", () => false)
    } catch (error) {
        console.log("Failed to register Alt+F4:", error)
    }

    // Notify renderer process
    mainWindow.webContents.send("kiosk-mode-changed", true)

    // Apply Windows-specific enhancements
    if (process.platform === "win32") {
        enhanceWindowsKioskMode(true)
        
        // Import the new function directly to ensure it's called
        const { blockWindowsKeyStartMenu } = require("./kiosk-helper.js")
        blockWindowsKeyStartMenu()
        
        // Add renderer process listener to respond to key events
        mainWindow.webContents.on('before-input-event', (event, input) => {
            // Block Windows key at browser level
            if (input.key === 'Meta' || input.key === 'OS' || input.code === 'MetaLeft' || input.code === 'MetaRight') {
                event.preventDefault();
                console.log("Windows key blocked at browser level");
                return false;
            }
        });
    }
}

// Disable kiosk mode
function disableKioskMode() {
    if (!mainWindow) return

    isKioskMode = false

    // Reset window properties
    mainWindow.setKiosk(false)
    mainWindow.setAlwaysOnTop(false)
    mainWindow.setClosable(true)
    mainWindow.setFullScreen(false)
    mainWindow.setMenuBarVisibility(true)

    // Restore Windows settings
    if (process.platform === "win32") {
        enhanceWindowsKioskMode(false)
    }

    // Unregister all shortcuts
    globalShortcut.unregisterAll()

    // Notify renderer process
    mainWindow.webContents.send("kiosk-mode-changed", false)
}

// Handle IPC messages from renderer
ipcMain.on("toggle-kiosk-mode", (event, enable) => {
    if (enable) {
        enableKioskMode()
    } else {
        disableKioskMode()
    }
})

// Get current kiosk mode status
ipcMain.handle("get-kiosk-mode", () => {
    return isKioskMode
})

app.whenReady().then(() => {
    createWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

// Clean up when app is quitting
app.on("will-quit", () => {
    globalShortcut.unregisterAll()
})

// Prevent the app from exiting when in kiosk mode
app.on("before-quit", (event) => {
    if (isKioskMode) {
        event.preventDefault()
    }
})
