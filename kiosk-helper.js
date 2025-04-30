// kiosk-helper.js - Additional helper for Windows-specific kiosk features
const { exec } = require("child_process")

// Helper functions for Windows-specific kiosk mode enhancements
function enhanceWindowsKioskMode(enable) {
    if (process.platform !== "win32") return

    if (enable) {
        // Block Windows key opening Start menu
        blockWindowsKeyStartMenu()

        // Disable Windows hot corners and gestures
        disableHotCorners()

        // Disable task view
        disableTaskView()

        // Disable Action Center
        disableActionCenter()

        // Disable touchpad edge swipes
        disableTouchpadGestures()

        // Optional: Hide taskbar completely (requires admin rights)
        hideTaskbar()
    } else {
        // Restore Windows key functionality
        restoreWindowsKeyFunctionality()

        // Restore Windows hot corners and gestures
        enableHotCorners()

        // Enable task view
        enableTaskView()

        // Enable Action Center
        enableActionCenter()

        // Enable touchpad edge swipes
        enableTouchpadGestures()

        // Show taskbar if it was hidden
        showTaskbar()
    }
}

// Block Windows key from opening Start menu using registry changes
function blockWindowsKeyStartMenu() {
    try {
        // Disable Windows key through registry
        // Method 1: Disable Start menu when Windows key is pressed
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f',
        )

        // Method 2: Disable Windows key functionality completely
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f',
        )

        // Method 3: Disable Start menu
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f',
        )

        // Method 4: Remap Windows key scancode (more aggressive)
        exec(
            'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /t REG_BINARY /d 00000000000000000300000000005BE000005CE000000000 /f',
        )

        // Restart explorer to apply changes
        exec("taskkill /f /im explorer.exe && start explorer.exe")

        console.log("Windows key disabled from opening Start menu")
    } catch (error) {
        console.error("Failed to block Windows key through registry:", error)
    }
}

// Restore Windows key functionality
function restoreWindowsKeyFunctionality() {
    try {
        // Remove registry modifications
        exec(
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f',
        )
        exec(
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f',
        )
        exec(
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f',
        )
        exec(
            'reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f',
        )

        // Restart explorer to apply changes
        exec("taskkill /f /im explorer.exe && start explorer.exe")

        console.log("Windows key functionality restored")
    } catch (error) {
        console.error("Failed to restore Windows key functionality:", error)
    }
}

// More aggressive approach to disable taskbar completely
function disableTaskbarCompletely(enable) {
    if (process.platform !== "win32") return

    if (enable) {
        try {
            // Disable taskbar completely using multiple methods

            // Method 1: Hide taskbar using Explorer settings
            exec(
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 0 /f',
            )

            // Method 2: Disable taskbar auto-hide animation
            exec(
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAnimations /t REG_DWORD /d 0 /f',
            )

            // Method 3: Set taskbar to auto-hide and then block access to it
            exec(
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3" /v Settings /t REG_BINARY /d 30000000feffffff02000000030000003e0000002800000000000000 /f',
            )

            // Method 4: Kill and restart explorer.exe to apply changes
            exec("taskkill /f /im explorer.exe && start explorer.exe")

            console.log("Taskbar completely disabled")
        } catch (error) {
            console.error("Failed to disable taskbar completely:", error)
        }
    } else {
        try {
            // Restore taskbar functionality
            exec(
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f',
            )
            exec(
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAnimations /t REG_DWORD /d 1 /f',
            )

            // Restart explorer to apply changes
            exec("taskkill /f /im explorer.exe && start explorer.exe")

            console.log("Taskbar functionality restored")
        } catch (error) {
            console.error("Failed to restore taskbar:", error)
        }
    }
}

// Disable Windows 10/11 hot corners
function disableHotCorners() {
    try {
        // Disable peek
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 1 /f',
        )

        // Disable task view
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f',
        )

        // Disable Start menu corner
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 1 /f',
        )

        console.log("Windows hot corners disabled")
    } catch (error) {
        console.error("Failed to disable hot corners:", error)
    }
}

// Enable Windows 10/11 hot corners
function enableHotCorners() {
    try {
        // Enable peek
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f',
        )

        // Enable task view
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f',
        )

        // Enable Start menu corner
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f',
        )

        console.log("Windows hot corners enabled")
    } catch (error) {
        console.error("Failed to enable hot corners:", error)
    }
}

// Disable Windows task view
function disableTaskView() {
    try {
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 2 /f',
        )
        console.log("Task view disabled")
    } catch (error) {
        console.error("Failed to disable task view:", error)
    }
}

// Enable Windows task view
function enableTaskView() {
    try {
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f',
        )
        console.log("Task view enabled")
    } catch (error) {
        console.error("Failed to enable task view:", error)
    }
}

// Disable Windows Action Center
function disableActionCenter() {
    try {
        exec(
            'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 1 /f',
        )
        console.log("Action Center disabled")
    } catch (error) {
        console.error("Failed to disable Action Center:", error)
    }
}

// Enable Windows Action Center
function enableActionCenter() {
    try {
        exec(
            'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f',
        )
        console.log("Action Center enabled")
    } catch (error) {
        console.error("Failed to enable Action Center:", error)
    }
}

// Disable touchpad edge swipes
function disableTouchpadGestures() {
    try {
        // Disable edge swipes
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 0 /f',
        )

        // Disable three finger gestures
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 0 /f',
        )

        // Disable four finger gestures
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 0 /f',
        )

        console.log("Touchpad gestures disabled")
    } catch (error) {
        console.error("Failed to disable touchpad gestures:", error)
    }
}

// Enable touchpad edge swipes
function enableTouchpadGestures() {
    try {
        // Enable edge swipes
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f',
        )

        // Enable three finger gestures
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f',
        )

        // Enable four finger gestures
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f',
        )

        console.log("Touchpad gestures enabled")
    } catch (error) {
        console.error("Failed to enable touchpad gestures:", error)
    }
}

// Hide taskbar
function hideTaskbar() {
    try {
        exec(
            "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=3;&Set-ItemProperty -Path $p -Name Settings -Value $v;&Stop-Process -f -ProcessName explorer}\"",
        )
        console.log("Taskbar hidden")
    } catch (error) {
        console.error("Failed to hide taskbar:", error)
    }
}

// Show taskbar
function showTaskbar() {
    try {
        exec(
            "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;&Stop-Process -f -ProcessName explorer}\"",
        )
        console.log("Taskbar shown")
    } catch (error) {
        console.error("Failed to show taskbar:", error)
    }
}

module.exports = {
    enhanceWindowsKioskMode,
    disableTaskbarCompletely,
    blockWindowsKeyStartMenu,
    restoreWindowsKeyFunctionality
}
