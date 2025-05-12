declare module 'windows-key-blocker' {
    import App = Electron.App;

    export interface WindowsKeyBlockerOptions {
        useNativeHook?: boolean;
        useAltTabBlocker?: boolean;
        useElectronShortcuts?: boolean;
        electronApp?: App;
    }

    export interface BlockerResults {
        nativeHook: boolean;
        altTabBlocker: boolean;
        electronShortcuts: boolean;
    }

    export interface WindowsKeyBlocker {
        enable: () => BlockerResults;
        disable: () => BlockerResults;
        isActive: boolean;
    }

    export function initWindowsKeyBlocker(options?: WindowsKeyBlockerOptions): WindowsKeyBlocker;
}
