# Windows Key Blocker for Electron Kiosk Mode

This solution provides a comprehensive approach to blocking the Windows key from opening the Start menu in Electron kiosk applications.

## How It Works

This implementation uses multiple approaches to ensure the Windows key is completely blocked:

1. **System-Level Keyboard Hook (Native Addon)**
   - Uses Windows API `SetWindowsHookEx` with `WH_KEYBOARD_LL` to intercept and block Windows key presses at the system level
   - Implemented as a native Node.js addon for maximum effectiveness

2. **PowerShell-Based Keyboard Hook (Fallback)**
   - Provides a secondary keyboard hook using PowerShell and .NET if the native addon fails
   - Uses similar Windows API calls but through PowerShell script

3. **Registry Modifications**
   - Applies multiple registry changes to disable Windows key functionality:
     - `NoWinKeys` policy to disable Windows key shortcuts
     - Keyboard scancode remapping to neutralize Windows key
     - Explorer hotkey disabling

4. **Electron's Global Shortcut API**
   - Blocks Windows key at the application level using Electron's built-in capabilities
   - Covers multiple key identifiers (Meta, Super, LWin, RWin)

5. **Browser-Level Event Interception**
   - Captures key events at the browser level using `before-input-event`
   - Prevents Windows key events from reaching the page

6. **DOM-Level Event Capture**
   - Intercepts Windows key at the DOM level through the preload script
   - Uses event capture phase for earlier interception

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Build the native addon:
   ```
   npm run rebuild
   ```

3. Start the application:
   ```
   npm start
   ```

## Requirements

- Windows operating system
- Node.js 14+
- Visual Studio Build Tools (for native addon compilation)
- Administrator privileges (for some registry modifications)

## Notes

- Some registry modifications may require administrator privileges
- The system may need to be restarted for certain changes to take effect
- This solution is designed for Windows specifically and will not affect other operating systems
