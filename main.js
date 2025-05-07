// main.js
const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require("electron")
const path = require("path")

// Импортируем наш новый модуль для блокировки Windows клавиши
const { initWindowsKeyBlocker } = require("windows-key-blocker")

let mainWindow
let isKioskMode = false
let winKeyBlocker = null

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

    // Инициализируем блокировщик Windows клавиши с полной конфигурацией
    if (!winKeyBlocker) {
        winKeyBlocker = initWindowsKeyBlocker({
            useNativeHook: true,
            useRegistry: true,
            useAltTabBlocker: true,
            useElectronShortcuts: true,
            electronApp: app
        });
    }

    // Активируем расширенный режим киоска (блокирует Windows клавишу и Alt+Tab)
    if (process.platform === "win32") {
        // Включаем все блокировки сразу
        winKeyBlocker.enhanceKioskMode(true);
        console.log("Windows key blocker activated in enhanced kiosk mode");
        
        // Добавляем дополнительную блокировку на уровне окна браузера
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.on('before-input-event', (event, input) => {
                // Block Windows key at browser level
                if (input.key === 'Meta' || input.key === 'OS' || input.code === 'MetaLeft' || input.code === 'MetaRight') {
                    event.preventDefault();
                    console.log("Windows key blocked at browser level");
                    return false;
                }
                
                // Block Alt+Tab at browser level
                if (input.altKey && input.key === 'Tab') {
                    event.preventDefault();
                    console.log("Alt+Tab blocked at browser level");
                    return false;
                }
            });
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

    mainWindow.setClosable(false)
    mainWindow.setFullScreen(true)
    mainWindow.setMenuBarVisibility(false)

    // Notify renderer process
    mainWindow.webContents.send("kiosk-mode-changed", true)
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

    // Отключаем блокировку Windows клавиши
    if (process.platform === "win32" && winKeyBlocker) {
        winKeyBlocker.enhanceKioskMode(false);
        console.log("Windows key blocker deactivated");
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
    
    // Также отключаем блокировку Windows клавиши при выходе
    if (process.platform === "win32" && winKeyBlocker) {
        winKeyBlocker.disable();
    }
})

// Prevent the app from exiting when in kiosk mode
app.on("before-quit", (event) => {
    if (isKioskMode) {
        event.preventDefault()
    }
})
