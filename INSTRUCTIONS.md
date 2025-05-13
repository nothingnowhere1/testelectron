# How to Fix Alt+Tab and Windows Key Functionality

This project has been updated to properly restore Alt+Tab, Alt+F4, and touchpad functionality when disabling kiosk mode.

## Files Modified:

1. `renderer.js` - Added complete restoration call when exiting kiosk mode
2. `preload.js` - Made keyboard blocking conditional on kiosk mode status
3. `windows-key-blocker/src/index.ts` - Enhanced the disableBlocker() function
4. `windows-key-blocker/src/lib/alt-tab-blocker.ts` - Improved PowerShell process termination
5. `complete_restore.bat` - Added a comprehensive restoration script
6. `main-fix.js` - Guide for adding restoration functionality to your main process

## How to Use:

### Regular Usage:
The application should now properly restore all Windows functionality when you exit kiosk mode. The fixes ensure that:

1. Alt+Tab works again
2. Alt+F4 works again
3. Touchpad functionality is restored
4. Windows key functionality is restored

### Emergency Restoration:
If you still experience issues, run the `complete_restore.bat` script as Administrator. This script:

1. Kills all blocker processes
2. Removes all registry modifications
3. Restores default Windows settings
4. Resets keyboard hooks
5. Fixes StuckRects3 settings for taskbar
6. Restarts Explorer

### Rebuilding the Native Module:
After making these changes, you may need to rebuild the Windows Key Blocker native module:

```bash
cd windows-key-blocker
npm run build
```

Then restart your application.

## How it Works:

1. The system now uses multiple methods to ensure all blocking processes are terminated
2. Registry settings are properly restored
3. Low-level keyboard hooks are explicitly unhooked
4. The application sends a complete restoration IPC message when exiting kiosk mode

These changes ensure that all Windows functionality is properly restored when you exit kiosk mode or close the application.
