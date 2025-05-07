/**
 * Windows Key Blocker Module
 * 
 * A comprehensive module for blocking Windows key and other system shortcuts
 * in kiosk-mode applications. Includes both high-level and low-level hooks.
 */

import { 
  startBlockingWindowsKey, 
  stopBlockingWindowsKey 
} from './lib/native-blocker';

import { 
  blockAltTabSwitching, 
  restoreAltTabSwitching 
} from './lib/alt-tab-blocker';

import {
  blockWindowsKeyRegistry,
  restoreWindowsKeyRegistry,
  enhanceKioskMode,
  disableKioskMode
} from './lib/registry-blocker';

import {
  registerElectronShortcuts,
  unregisterElectronShortcuts,
  addBrowserWindowKeyHandlers
} from './lib/electron-shortcuts';

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
export function initWindowsKeyBlocker(options: WindowsKeyBlockerOptions = {}): WindowsKeyBlocker {
  const defaultOptions: WindowsKeyBlockerOptions = {
    useNativeHook: true,
    useRegistry: true,
    useAltTabBlocker: true,
    useElectronShortcuts: true,
    electronApp: null
  };

  const config = { ...defaultOptions, ...options };
  
  function enableBlocker(): BlockerResults {
    let results: BlockerResults = {
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
        results.nativeHook = startBlockingWindowsKey();
        console.log('Windows Key Blocker: Native hook ' + 
          (results.nativeHook ? 'started' : 'failed'));
      } catch (err) {
        console.error('Windows Key Blocker: Failed to start native hook', err);
      }
    }

    if (config.useRegistry) {
      try {
        blockWindowsKeyRegistry();
        results.registry = true;
        console.log('Windows Key Blocker: Registry modifications applied');
      } catch (err) {
        console.error('Windows Key Blocker: Failed to apply registry modifications', err);
      }
    }

    if (config.useAltTabBlocker) {
      try {
        blockAltTabSwitching();
        results.altTabBlocker = true;
        console.log('Windows Key Blocker: Alt+Tab blocker started');
      } catch (err) {
        console.error('Windows Key Blocker: Failed to start Alt+Tab blocker', err);
      }
    }

    if (config.useElectronShortcuts && config.electronApp) {
      try {
        registerElectronShortcuts(config.electronApp);
        results.electronShortcuts = true;
        console.log('Windows Key Blocker: Electron shortcuts registered');
      } catch (err) {
        console.error('Windows Key Blocker: Failed to register Electron shortcuts', err);
      }
    }

    return results;
  }

  function disableBlocker(): BlockerResults {
    let results: BlockerResults = {
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
        results.nativeHook = stopBlockingWindowsKey();
        console.log('Windows Key Blocker: Native hook ' + 
          (results.nativeHook ? 'stopped' : 'was not running'));
      } catch (err) {
        console.error('Windows Key Blocker: Failed to stop native hook', err);
      }
    }

    if (config.useRegistry) {
      try {
        restoreWindowsKeyRegistry();
        results.registry = true;
        console.log('Windows Key Blocker: Registry modifications removed');
      } catch (err) {
        console.error('Windows Key Blocker: Failed to remove registry modifications', err);
      }
    }

    if (config.useAltTabBlocker) {
      try {
        restoreAltTabSwitching();
        results.altTabBlocker = true;
        console.log('Windows Key Blocker: Alt+Tab functionality restored');
      } catch (err) {
        console.error('Windows Key Blocker: Failed to restore Alt+Tab functionality', err);
      }
    }

    if (config.useElectronShortcuts && config.electronApp) {
      try {
        unregisterElectronShortcuts(config.electronApp);
        results.electronShortcuts = true;
        console.log('Windows Key Blocker: Electron shortcuts unregistered');
      } catch (err) {
        console.error('Windows Key Blocker: Failed to unregister Electron shortcuts', err);
      }
    }

    return results;
  }

  function enhanceFullKioskMode(enable: boolean): boolean {
    if (process.platform !== 'win32') return false;
    
    if (enable) {
      enableBlocker();
      enhanceKioskMode(true);
      return true;
    } else {
      disableBlocker();
      disableKioskMode(false);
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
export const native = {
  startBlockingWindowsKey,
  stopBlockingWindowsKey
};

export const altTab = {
  blockAltTabSwitching,
  restoreAltTabSwitching
};

export const registry = {
  blockWindowsKeyRegistry,
  restoreWindowsKeyRegistry,
  enhanceKioskMode,
  disableKioskMode
};

export const electron = {
  registerElectronShortcuts,
  unregisterElectronShortcuts,
  addBrowserWindowKeyHandlers
};
