/**
 * Windows Key Blocker Module
 *
 * A comprehensive module for blocking Windows key and other system shortcuts
 * in kiosk-mode applications. Includes both high-level and low-level hooks.
 */
import { startBlockingWindowsKey, stopBlockingWindowsKey } from './lib/native-blocker';
import { blockAltTabSwitching, restoreAltTabSwitching } from './lib/alt-tab-blocker';
import { blockWindowsKeyRegistry, restoreWindowsKeyRegistry, enhanceKioskMode, disableKioskMode } from './lib/registry-blocker';
import { registerElectronShortcuts, unregisterElectronShortcuts, addBrowserWindowKeyHandlers } from './lib/electron-shortcuts';
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
    /** Check if blocking is currently active */
    isActive: () => boolean;
    /** Create a system restore script for emergency use */
    createEmergencyRestoreScript: () => string;
    /** Force a complete system restore even if normal disable failed */
    forceSystemRestore: () => Promise<boolean>;
}
/**
 * Initialize Windows key blocking with all available methods
 * @param options Configuration options
 * @returns Control methods for the blocker
 */
export declare function initWindowsKeyBlocker(options?: WindowsKeyBlockerOptions): WindowsKeyBlocker;
export declare const native: {
    startBlockingWindowsKey: typeof startBlockingWindowsKey;
    stopBlockingWindowsKey: typeof stopBlockingWindowsKey;
};
export declare const altTab: {
    blockAltTabSwitching: typeof blockAltTabSwitching;
    restoreAltTabSwitching: typeof restoreAltTabSwitching;
};
export declare const registry: {
    blockWindowsKeyRegistry: typeof blockWindowsKeyRegistry;
    restoreWindowsKeyRegistry: typeof restoreWindowsKeyRegistry;
    enhanceKioskMode: typeof enhanceKioskMode;
    disableKioskMode: typeof disableKioskMode;
};
export declare const electron: {
    registerElectronShortcuts: typeof registerElectronShortcuts;
    unregisterElectronShortcuts: typeof unregisterElectronShortcuts;
    addBrowserWindowKeyHandlers: typeof addBrowserWindowKeyHandlers;
};
