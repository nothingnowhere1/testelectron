# Windows Key Blocker for Electron Kiosk Mode

This solution provides a comprehensive approach to blocking the Windows key from opening the Start menu in Electron kiosk applications.

## How It Works

This implementation uses multiple approaches to ensure the Windows key is completely blocked:

1. **PowerShell-Based Keyboard Hook**
   - Uses a PowerShell script with Windows API hooks to intercept Windows key presses
   - Runs as a separate process that will continue blocking even if the main app crashes

2. **Registry Modifications**
   - Applies multiple registry changes to disable Windows key functionality:
     - `NoWinKeys` policy to disable Windows key shortcuts
     - Disabling Start menu functionality
     - Disabling Windows hotkeys

3. **Start Menu Process Termination**
   - Continuously monitors and kills the Start menu process if it attempts to launch
   - Creates a background process that keeps the Start menu from appearing

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

Simply install the application's dependencies:

```
npm install
```

Then start the application:

```
npm start
```

## Requirements

- Windows operating system
- Administrator privileges (for registry modifications)

## Notes

- Some registry modifications require administrator privileges
- The system may need to be restarted for certain changes to take full effect
- This solution is designed for Windows specifically and will not affect other operating systems
- When disabling kiosk mode, the application will attempt to restore normal Windows key functionality
