/**
 * Windows Registry Blocker
 * 
 * Implements Windows key blocking using registry modifications.
 * These techniques modify system settings to disable various
 * Windows hotkeys and shortcuts.
 */

import { exec } from 'child_process';

/**
 * Block Windows key from opening Start menu using registry changes
 * @returns True if successful
 */
export function blockWindowsKeyRegistry(): boolean {
  if (process.platform !== 'win32') return false;
  
  try {
    // Disable Windows key through registry
    // Method 1: Disable Start menu when Windows key is pressed
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f',
    );

    // Method 2: Disable Windows key functionality completely
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f',
    );

    // Method 3: Disable Start menu
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f',
    );

    // Method 4: Remap Windows key scancode (more aggressive)
    exec(
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /t REG_BINARY /d 00000000000000000300000000005BE000005CE000000000 /f',
    );

    // Restart explorer to apply changes
    exec("taskkill /f /im explorer.exe && start explorer.exe");

    console.log("Windows key disabled from opening Start menu");
    return true;
  } catch (error) {
    console.error("Failed to block Windows key through registry:", error);
    return false;
  }
}

/**
 * Restore Windows key functionality by removing registry modifications
 * @returns True if successful
 */
export function restoreWindowsKeyRegistry(): boolean {
  if (process.platform !== 'win32') return false;
  
  try {
    // Remove registry modifications
    exec(
      'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f',
    );
    exec(
      'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f',
    );
    exec(
      'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f',
    );
    exec(
      'reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f',
    );

    // Restart explorer to apply changes
    exec("taskkill /f /im explorer.exe && start explorer.exe");

    console.log("Windows key functionality restored");
    return true;
  } catch (error) {
    console.error("Failed to restore Windows key functionality:", error);
    return false;
  }
}

/**
 * Enhance kiosk mode with additional Windows-specific settings
 * @param enable True to enable kiosk mode enhancements, false to disable
 * @returns True if successful
 */
export function enhanceKioskMode(enable: boolean): boolean {
  if (process.platform !== 'win32') return false;

  if (enable) {
    // Block Windows key opening Start menu
    blockWindowsKeyRegistry();

    // Disable Windows hot corners and gestures
    disableHotCorners();

    // Disable task view
    disableTaskView();

    // Disable Action Center
    disableActionCenter();

    // Disable touchpad edge swipes
    disableTouchpadGestures();

    // Optional: Hide taskbar completely
    hideTaskbar();
    
    return true;
  } else {
    // Restore Windows key functionality
    restoreWindowsKeyRegistry();

    // Restore Windows hot corners and gestures
    enableHotCorners();

    // Enable task view
    enableTaskView();

    // Enable Action Center
    enableActionCenter();

    // Enable touchpad edge swipes
    enableTouchpadGestures();

    // Show taskbar if it was hidden
    showTaskbar();
    
    return true;
  }
}

/**
 * Disable kiosk mode and restore normal Windows functionality
 * @param enable True to enable normal Windows functionality
 * @returns True if successful
 */
export function disableKioskMode(enable: boolean): boolean {
  return enhanceKioskMode(!enable);
}

/**
 * Disable Windows 10/11 hot corners
 * @returns True if successful
 */
export function disableHotCorners(): boolean {
  try {
    // Disable peek
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 1 /f',
    );

    // Disable task view
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f',
    );

    // Disable Start menu corner
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 1 /f',
    );

    console.log("Windows hot corners disabled");
    return true;
  } catch (error) {
    console.error("Failed to disable hot corners:", error);
    return false;
  }
}

/**
 * Enable Windows 10/11 hot corners
 * @returns True if successful
 */
export function enableHotCorners(): boolean {
  try {
    // Enable peek
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f',
    );

    // Enable task view
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f',
    );

    // Enable Start menu corner
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f',
    );

    console.log("Windows hot corners enabled");
    return true;
  } catch (error) {
    console.error("Failed to enable hot corners:", error);
    return false;
  }
}

/**
 * Disable Windows task view
 * @returns True if successful
 */
export function disableTaskView(): boolean {
  try {
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 2 /f',
    );
    console.log("Task view disabled");
    return true;
  } catch (error) {
    console.error("Failed to disable task view:", error);
    return false;
  }
}

/**
 * Enable Windows task view
 * @returns True if successful
 */
export function enableTaskView(): boolean {
  try {
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f',
    );
    console.log("Task view enabled");
    return true;
  } catch (error) {
    console.error("Failed to enable task view:", error);
    return false;
  }
}

/**
 * Disable Windows Action Center
 * @returns True if successful
 */
export function disableActionCenter(): boolean {
  try {
    exec(
      'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 1 /f',
    );
    console.log("Action Center disabled");
    return true;
  } catch (error) {
    console.error("Failed to disable Action Center:", error);
    return false;
  }
}

/**
 * Enable Windows Action Center
 * @returns True if successful
 */
export function enableActionCenter(): boolean {
  try {
    exec(
      'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f',
    );
    console.log("Action Center enabled");
    return true;
  } catch (error) {
    console.error("Failed to enable Action Center:", error);
    return false;
  }
}

/**
 * Disable touchpad edge swipes
 * @returns True if successful
 */
export function disableTouchpadGestures(): boolean {
  try {
    // Disable edge swipes
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 0 /f',
    );

    // Disable three finger gestures
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 0 /f',
    );

    // Disable four finger gestures
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 0 /f',
    );

    console.log("Touchpad gestures disabled");
    return true;
  } catch (error) {
    console.error("Failed to disable touchpad gestures:", error);
    return false;
  }
}

/**
 * Enable touchpad edge swipes
 * @returns True if successful
 */
export function enableTouchpadGestures(): boolean {
  try {
    // Enable edge swipes
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f',
    );

    // Enable three finger gestures
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f',
    );

    // Enable four finger gestures
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f',
    );

    console.log("Touchpad gestures enabled");
    return true;
  } catch (error) {
    console.error("Failed to enable touchpad gestures:", error);
    return false;
  }
}

/**
 * Hide taskbar
 * @returns True if successful
 */
export function hideTaskbar(): boolean {
  try {
    exec(
      "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=3;&Set-ItemProperty -Path $p -Name Settings -Value $v;&Stop-Process -f -ProcessName explorer}\"",
    );
    console.log("Taskbar hidden");
    return true;
  } catch (error) {
    console.error("Failed to hide taskbar:", error);
    return false;
  }
}

/**
 * Show taskbar
 * @returns True if successful
 */
export function showTaskbar(): boolean {
  try {
    exec(
      "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;&Stop-Process -f -ProcessName explorer}\"",
    );
    console.log("Taskbar shown");
    return true;
  } catch (error) {
    console.error("Failed to show taskbar:", error);
    return false;
  }
}
