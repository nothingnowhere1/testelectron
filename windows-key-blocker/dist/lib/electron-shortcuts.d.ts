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
 * Register global shortcuts to block various key combinations in Electron
 * @param electronApp The Electron app instance
 * @returns True if successful
 */
export declare function registerElectronShortcuts(electronApp: ElectronApp): boolean;
/**
 * Unregister all global shortcuts
 * @param electronApp The Electron app instance
 * @returns True if successful
 */
export declare function unregisterElectronShortcuts(electronApp: ElectronApp): boolean;
/**
 * Add BrowserWindow event handlers to block key combinations
 * @param browserWindow The Electron BrowserWindow instance
 * @returns True if successful
 */
export declare function addBrowserWindowKeyHandlers(browserWindow: BrowserWindow): boolean;
export {};
