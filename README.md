# Native Windows Key Blocker for Electron Kiosk Mode

This solution provides a system-level approach to blocking the Windows key from opening the Start menu in Electron kiosk applications, using a native C++ addon.

## How It Works

This implementation uses Windows API's low-level keyboard hook to intercept and block the Windows key:

1. **Native C++ Addon with System-Level Hook**
   - Uses Windows API `SetWindowsHookEx` with `WH_KEYBOARD_LL` to create a global keyboard hook
   - Intercepts Windows key presses at the OS level before they reach any application
   - Blocks both left and right Windows keys (VK_LWIN and VK_RWIN)

2. **Electron's Global Shortcut API (Fallback)**
   - Acts as a secondary layer of protection using Electron's built-in capabilities
   - Covers multiple key identifiers (Meta, Super, LWin, RWin)

## Installation & Building

The native addon requires compilation. Follow these steps to set up:

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
   # For general Node.js
   node-gyp rebuild
   
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
- Administrator privileges may be required

## Troubleshooting

If you encounter build issues:

1. Make sure you have Visual Studio Build Tools installed
2. Run the command prompt or terminal as Administrator
3. Ensure you have Python 2.7 installed (required for node-gyp)

## Technical Details

The native addon creates a system-level keyboard hook using `SetWindowsHookEx` with the `WH_KEYBOARD_LL` hook type. This allows it to intercept keyboard input at the lowest level possible, before it reaches any application, including the Windows shell.

When a key press is detected, the hook checks if it's a Windows key (VK_LWIN = 0x5B or VK_RWIN = 0x5C) and if so, blocks it by returning 1 from the hook procedure.
