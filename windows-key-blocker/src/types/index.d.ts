declare module 'windows-key-blocker' {
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

    export interface WindowsKeyBlocker {
        enable: () => BlockerResults;
        disable: () => BlockerResults;
        enhanceKioskMode: (enable: boolean) => boolean;
    }

    export function initWindowsKeyBlocker(options?: WindowsKeyBlockerOptions): WindowsKeyBlocker;
}

declare module '*/addon/bindings' {
    export function startKeyboardHook(): boolean;

    export function stopKeyboardHook(): boolean;
}
