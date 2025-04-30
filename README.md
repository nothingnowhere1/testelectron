# Enhanced Kiosk Mode for Electron Apps

This solution provides comprehensive system-level blocking of Windows key and Alt+Tab switching in Electron kiosk applications.

## Features

1. **System-Level Windows Key Blocking**
   - Uses a native C++ addon with Windows API's low-level keyboard hook
   - Intercepts and blocks the Windows key before it can open the Start menu
   - Works at the OS level for maximum effectiveness

2. **Complete Alt+Tab Blocking**
   - Prevents users from seeing the Alt+Tab application switcher preview
   - Uses multiple techniques to block Alt+Tab functionality:
     - Native C++ hooks to intercept Alt+Tab key combinations
     - Registry modifications to disable taskbar thumbnails and switching features
     - PowerShell-based secondary keyboard hook for redundancy
   
3. **Multiple Layers of Protection**
   - System-level hooks via native C++ addon
   - Registry modifications for system-wide settings
   - PowerShell and VBScript based blockers
   - Electron's built-in keyboard shortcut handling
   - Browser-level event interception

## Installation & Building

The solution requires building a native C++ addon:

1. Install required dependencies:
   ```bash
   npm install
   ```

2. Install build tools (if you don't have them already):
   ```bash
   npm install -g node-gyp
   npm install -g windows-build-tools  # On Windows, run as Administrator
   ```

3. Build the native addon:
   ```bash
   # For Electron (recommended)
   npm run rebuild
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Requirements

- Windows operating system
- Visual Studio Build Tools (for C++ compilation)
- Node.js 14+
- Administrator privileges for registry modifications

## Technical Details

### Windows Key Blocking
The native addon creates a system-level keyboard hook that intercepts Windows key presses (VK_LWIN and VK_RWIN) and prevents them from triggering the Start menu.

### Alt+Tab Blocking
Multiple techniques are used to block Alt+Tab functionality:

1. **Native Addon Hook**
   - Tracks Alt key state and blocks Tab key when Alt is pressed
   - Intercepts Alt+Tab at the system level

2. **Registry Modifications**
   - Disables taskbar thumbnails and animations
   - Modifies window switching behavior

3. **PowerShell Hook**
   - Secondary keyboard hook using PowerShell and .NET
   - Provides redundancy if the native hook fails

## Usage in Your Application

Enable kiosk mode with:
```javascript
// In your Electron main process
const { enableKioskMode } = require('./kiosk-helper');
enableKioskMode();
```

Disable kiosk mode and restore normal functionality with:
```javascript
const { disableKioskMode } = require('./kiosk-helper');
disableKioskMode();
```
