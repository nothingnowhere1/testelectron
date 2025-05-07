"use strict";
/**
 * Windows Key Blocker Module
 *
 * A comprehensive module for blocking Windows key and other system shortcuts
 * in kiosk-mode applications. Includes both high-level and low-level hooks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.electron = exports.registry = exports.altTab = exports.native = void 0;
exports.initWindowsKeyBlocker = initWindowsKeyBlocker;
const native_blocker_1 = require("./lib/native-blocker");
const alt_tab_blocker_1 = require("./lib/alt-tab-blocker");
const registry_blocker_1 = require("./lib/registry-blocker");
const electron_shortcuts_1 = require("./lib/electron-shortcuts");
/**
 * Initialize Windows key blocking with all available methods
 * @param options Configuration options
 * @returns Control methods for the blocker
 */
function initWindowsKeyBlocker(options = {}) {
    const defaultOptions = {
        useNativeHook: true,
        useRegistry: true,
        useAltTabBlocker: true,
        useElectronShortcuts: true,
        electronApp: null
    };
    const config = { ...defaultOptions, ...options };
    function enableBlocker() {
        let results = {
            nativeHook: false,
            registry: false,
            altTabBlocker: false,
            electronShortcuts: false
        };
        if (process.platform !== 'win32') {
            console.log('Windows Key Blocker: Not running on Windows, some features disabled');
            return results;
        }
        if (config.useNativeHook) {
            try {
                results.nativeHook = (0, native_blocker_1.startBlockingWindowsKey)();
                console.log('Windows Key Blocker: Native hook ' +
                    (results.nativeHook ? 'started' : 'failed'));
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to start native hook', err);
            }
        }
        if (config.useRegistry) {
            try {
                (0, registry_blocker_1.blockWindowsKeyRegistry)();
                results.registry = true;
                console.log('Windows Key Blocker: Registry modifications applied');
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to apply registry modifications', err);
            }
        }
        if (config.useAltTabBlocker) {
            try {
                (0, alt_tab_blocker_1.blockAltTabSwitching)();
                results.altTabBlocker = true;
                console.log('Windows Key Blocker: Alt+Tab blocker started');
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to start Alt+Tab blocker', err);
            }
        }
        if (config.useElectronShortcuts && config.electronApp) {
            try {
                (0, electron_shortcuts_1.registerElectronShortcuts)(config.electronApp);
                results.electronShortcuts = true;
                console.log('Windows Key Blocker: Electron shortcuts registered');
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to register Electron shortcuts', err);
            }
        }
        return results;
    }
    function disableBlocker() {
        let results = {
            nativeHook: false,
            registry: false,
            altTabBlocker: false,
            electronShortcuts: false
        };
        if (process.platform !== 'win32') {
            return results;
        }
        if (config.useNativeHook) {
            try {
                results.nativeHook = (0, native_blocker_1.stopBlockingWindowsKey)();
                console.log('Windows Key Blocker: Native hook ' +
                    (results.nativeHook ? 'stopped' : 'was not running'));
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to stop native hook', err);
            }
        }
        if (config.useRegistry) {
            try {
                (0, registry_blocker_1.restoreWindowsKeyRegistry)();
                results.registry = true;
                console.log('Windows Key Blocker: Registry modifications removed');
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to remove registry modifications', err);
            }
        }
        if (config.useAltTabBlocker) {
            try {
                (0, alt_tab_blocker_1.restoreAltTabSwitching)();
                results.altTabBlocker = true;
                console.log('Windows Key Blocker: Alt+Tab functionality restored');
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to restore Alt+Tab functionality', err);
            }
        }
        if (config.useElectronShortcuts && config.electronApp) {
            try {
                (0, electron_shortcuts_1.unregisterElectronShortcuts)(config.electronApp);
                results.electronShortcuts = true;
                console.log('Windows Key Blocker: Electron shortcuts unregistered');
            }
            catch (err) {
                console.error('Windows Key Blocker: Failed to unregister Electron shortcuts', err);
            }
        }
        return results;
    }
    function enhanceFullKioskMode(enable) {
        if (process.platform !== 'win32')
            return false;
        if (enable) {
            enableBlocker();
            (0, registry_blocker_1.enhanceKioskMode)(true);
            return true;
        }
        else {
            disableBlocker();
            (0, registry_blocker_1.disableKioskMode)(false);
            return true;
        }
    }
    return {
        enable: enableBlocker,
        disable: disableBlocker,
        enhanceKioskMode: enhanceFullKioskMode
    };
}
// Export direct APIs for advanced usage
exports.native = {
    startBlockingWindowsKey: native_blocker_1.startBlockingWindowsKey,
    stopBlockingWindowsKey: native_blocker_1.stopBlockingWindowsKey
};
exports.altTab = {
    blockAltTabSwitching: alt_tab_blocker_1.blockAltTabSwitching,
    restoreAltTabSwitching: alt_tab_blocker_1.restoreAltTabSwitching
};
exports.registry = {
    blockWindowsKeyRegistry: registry_blocker_1.blockWindowsKeyRegistry,
    restoreWindowsKeyRegistry: registry_blocker_1.restoreWindowsKeyRegistry,
    enhanceKioskMode: registry_blocker_1.enhanceKioskMode,
    disableKioskMode: registry_blocker_1.disableKioskMode
};
exports.electron = {
    registerElectronShortcuts: electron_shortcuts_1.registerElectronShortcuts,
    unregisterElectronShortcuts: electron_shortcuts_1.unregisterElectronShortcuts,
    addBrowserWindowKeyHandlers: electron_shortcuts_1.addBrowserWindowKeyHandlers
};
