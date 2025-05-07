/**
 * Type definitions for windows-key-blocker
 */

declare module 'windows-key-blocker' {
  /**
   * Configuration options for Windows key blocker
   */
  export interface WindowsKeyBlockerOptions {
    /** Use native C++ hook (most effective) */
    useNativeHook?: boolean;
    /** Use registry modifications */
    useRegistry?: boolean;
    /** Block Alt+Tab switching */
    useAltTabBlocker?: boolean;
    /** Use Electron global shortcuts */
    useElectronShortcuts?: boolean;
    /** Electron app instance for shortcuts */
    electronApp?: any;
  }

  /**
   * Result object for blocker operations
   */
  export interface BlockerResults {
    /** Status of native hook operation */
    nativeHook: boolean;
    /** Status of registry modification operation */
    registry: boolean;
    /** Status of Alt+Tab blocker operation */
    altTabBlocker: boolean;
    /** Status of Electron shortcuts operation */
    electronShortcuts: boolean;
  }

  /**
   * Windows key blocker control interface
   */
  export interface WindowsKeyBlocker {
    /** Enable Windows key blocking */
    enable: () => BlockerResults;
    /** Disable Windows key blocking */
    disable: () => BlockerResults;
    /** Enable or disable full kiosk mode with all enhancements */
    enhanceKioskMode: (enable: boolean) => boolean;
  }

  /**
   * Initialize Windows key blocking with all available methods
   * @param options Configuration options
   * @returns Control methods for the blocker
   */
  export function initWindowsKeyBlocker(options?: WindowsKeyBlockerOptions): WindowsKeyBlocker;

  /** Native Windows key blocker functions */
  export const native: {
    startBlockingWindowsKey: () => boolean;
    stopBlockingWindowsKey: () => boolean;
  };

  /** Alt+Tab blocking functions */
  export const altTab: {
    blockAltTabSwitching: () => boolean;
    restoreAltTabSwitching: () => boolean;
  };

  /** Registry modification functions */
  export const registry: {
    blockWindowsKeyRegistry: () => boolean;
    restoreWindowsKeyRegistry: () => boolean;
    enhanceKioskMode: (enable: boolean) => boolean;
    disableKioskMode: (enable: boolean) => boolean;
    disableHotCorners: () => boolean;
    enableHotCorners: () => boolean;
    disableTaskView: () => boolean;
    enableTaskView: () => boolean;
    disableActionCenter: () => boolean;
    enableActionCenter: () => boolean;
    disableTouchpadGestures: () => boolean;
    enableTouchpadGestures: () => boolean;
    hideTaskbar: () => boolean;
    showTaskbar: () => boolean;
  };

  /** Electron integration functions */
  export const electron: {
    registerElectronShortcuts: (electronApp: any) => boolean;
    unregisterElectronShortcuts: (electronApp: any) => boolean;
    addBrowserWindowKeyHandlers: (browserWindow: any) => boolean;
  };
}

declare module '*/addon/bindings' {
  export function startKeyboardHook(): boolean;
  export function stopKeyboardHook(): boolean;
}
