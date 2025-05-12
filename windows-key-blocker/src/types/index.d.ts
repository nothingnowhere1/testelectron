declare module 'windows-key-blocker' {
    export interface WindowsKeyBlockerOptions {
        useNativeHook?: boolean;
        useRegistry?: boolean;
        useAltTabBlocker?: boolean;
        useElectronShortcuts?: boolean;
        electronApp?: any;
    }

    export interface BlockerResults {
        nativeHook: boolean;
        registry: boolean;
        altTabBlocker: boolean;
        electronShortcuts: boolean;
    }

    export interface WindowsKeyBlocker {
        enable: () => BlockerResults;
        disable: () => BlockerResults;
        enhanceKioskMode: (enable: boolean) => boolean;
    }

    export function initWindowsKeyBlocker(options?: WindowsKeyBlockerOptions): WindowsKeyBlocker;

    export const native: {
        startBlockingWindowsKey: () => boolean;
        stopBlockingWindowsKey: () => boolean;
    };

    export const altTab: {
        blockAltTabSwitching: () => boolean;
        restoreAltTabSwitching: () => boolean;
    };

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
