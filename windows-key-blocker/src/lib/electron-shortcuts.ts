/**
 * Electron Shortcuts Handler
 * 
 * Implements keyboard shortcuts blocking using Electron globalShortcut API.
 * This approach handles the high-level keyboard events but may not catch 
 * all system shortcuts.
 */

/**
 * Electron App interface
 */
interface ElectronApp {
  isReady: () => boolean;
  whenReady: () => Promise<any>;
}

/**
 * Electron BrowserWindow interface
 */
interface BrowserWindow {
  webContents: {
    on: (eventName: string, listener: (event: any, input: any) => void) => void;
  };
}

/**
 * Electron GlobalShortcut interface
 */
interface GlobalShortcut {
  register: (accelerator: string, callback: () => boolean) => boolean;
  unregisterAll: () => void;
}

/**
 * Register global shortcuts to block various key combinations in Electron
 * @param electronApp The Electron app instance
 * @returns True if successful
 */
export function registerElectronShortcuts(electronApp: ElectronApp): boolean {
  if (!electronApp || !electronApp.whenReady) {
    console.error('Invalid Electron app instance provided');
    return false;
  }

  // Ensure the app is ready before registering shortcuts
  const registerShortcuts = (): boolean => {
    if (!electronApp.isReady()) {
      electronApp.whenReady().then(registerShortcuts);
      return false;
    }

    try {
      // Get reference to globalShortcut
      const { globalShortcut } = require('electron') as { globalShortcut: GlobalShortcut };

      // Block Windows key variations
      globalShortcut.register("Super", () => {
        console.log("Windows key (Super) blocked");
        return false;
      });
      
      // Block left Windows key specifically
      globalShortcut.register("Super+L", () => {
        console.log("Left Windows key blocked");
        return false;
      });
      
      // Block right Windows key specifically  
      globalShortcut.register("Super+R", () => {
        console.log("Right Windows key blocked");
        return false;
      });
      
      // Block Windows key as "Meta" (some systems use this identifier)
      globalShortcut.register("Meta", () => {
        console.log("Windows key (Meta) blocked");
        return false;
      });
      
      // Block LWin and RWin which are more specific identifiers
      globalShortcut.register("LWin", () => {
        console.log("LWin key blocked");
        return false;
      });
      
      globalShortcut.register("RWin", () => {
        console.log("RWin key blocked");
        return false;
      });

      // Block additional key combinations
      // Block Alt+Tab
      globalShortcut.register("Alt+Tab", () => {
        console.log("Alt+Tab blocked");
        return false;
      });
      
      // Block Alt+Esc
      globalShortcut.register("Alt+Escape", () => {
        console.log("Alt+Escape blocked");
        return false;
      });
      
      // Block Ctrl+Alt+Delete (though this likely can't be fully blocked)
      try {
        globalShortcut.register("Ctrl+Alt+Delete", () => {
          console.log("Attempted to block Ctrl+Alt+Delete");
          return false;
        });
      } catch (error) {
        console.log("Cannot block Ctrl+Alt+Delete: ", error);
      }
      
      // Block Super key combinations (alternative naming)
      globalShortcut.register("Super+D", () => false);
      globalShortcut.register("Super+E", () => false);
      globalShortcut.register("Super+F", () => false);
      globalShortcut.register("Super+Tab", () => false);

      // Block additional touchpad/mouse related shortcuts
      globalShortcut.register("Alt+Esc", () => false);
      globalShortcut.register("Ctrl+Esc", () => false);

      // Register all common shortcuts to prevent them from working
      const shortcuts = ["Alt+F4", "Alt+Tab", "Ctrl+Esc", "Ctrl+Shift+Esc", "F11", "Esc", "Tab", "Ctrl+W", "Alt+Space"];

      // Block all function keys F1-F12
      for (let i = 1; i <= 12; i++) {
        try {
          globalShortcut.register(`F${i}`, () => {
            console.log(`F${i} is blocked in kiosk mode`);
            return false;
          });
        } catch (error) {
          console.log(`Failed to register F${i}:`, error);
        }
      }

      // Block common shortcuts
      shortcuts.forEach((shortcut) => {
        try {
          globalShortcut.register(shortcut, () => {
            console.log(`${shortcut} is blocked in kiosk mode`);
            return false;
          });
        } catch (error) {
          console.log(`Failed to register shortcut: ${shortcut}`, error);
        }
      });
      
      console.log('Electron shortcuts registered successfully');
      return true;
    } catch (error) {
      console.error('Failed to register Electron shortcuts:', error);
      return false;
    }
  };

  return registerShortcuts();
}

/**
 * Unregister all global shortcuts
 * @param electronApp The Electron app instance
 * @returns True if successful
 */
export function unregisterElectronShortcuts(electronApp: ElectronApp): boolean {
  if (!electronApp) {
    console.error('Invalid Electron app instance provided');
    return false;
  }

  try {
    const { globalShortcut } = require('electron') as { globalShortcut: GlobalShortcut };
    globalShortcut.unregisterAll();
    console.log('Electron shortcuts unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister Electron shortcuts:', error);
    return false;
  }
}

/**
 * Add BrowserWindow event handlers to block key combinations
 * @param browserWindow The Electron BrowserWindow instance
 * @returns True if successful
 */
export function addBrowserWindowKeyHandlers(browserWindow: BrowserWindow): boolean {
  if (!browserWindow) {
    console.error('Invalid BrowserWindow instance provided');
    return false;
  }

  try {
    // Add renderer process listener to respond to key events
    browserWindow.webContents.on('before-input-event', (event: any, input: any) => {
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

    console.log('Browser window key handlers added');
    return true;
  } catch (error) {
    console.error('Failed to add browser window key handlers:', error);
    return false;
  }
}
