import {startBlockingWindowsKey, stopBlockingWindowsKey} from './lib/native-blocker';

import {blockAltTabSwitching, restoreAltTabSwitching} from './lib/alt-tab-blocker';

import {
    blockWindowsKeyRegistry,
    disableKioskMode,
    enhanceKioskMode,
    restoreWindowsKeyRegistry
} from './lib/registry-blocker';

import {registerElectronShortcuts, unregisterElectronShortcuts,} from './lib/electron-shortcuts';

import * as fs from 'fs';
import * as path from 'path';
import {exec} from 'child_process';

let blockingActive = false;

export interface WindowsKeyBlockerOptions {
    /** Use native C++ hook (most effective) */
    useNativeHook?: boolean;
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
    nativeHook: boolean;
    registry: boolean;
    altTabBlocker: boolean;
    electronShortcuts: boolean;
}

export interface WindowsKeyBlocker {
    /** Enable Windows key blocking */
    enable: () => BlockerResults;
    /** Disable Windows key blocking */
    disable: () => BlockerResults;
    /** Check if blocking is currently active */
    isActive: () => boolean;
    /** Create a system restore script for emergency use */
    createEmergencyRestoreScript: () => string;
    /** Force a complete system restore even if normal disable failed */
    forceSystemRestore: () => Promise<boolean>;
}

/**
 * Creates an emergency script to restore system functionality
 * @returns Path to the created script
 */
function createEmergencyRestoreScript(): string {
    const restoreScript = `@echo off
echo Экстренное восстановление функциональности Windows...

REM Завершаем все процессы PowerShell, связанные с блокировкой Alt+Tab
echo Завершение блокировщиков Alt+Tab...
taskkill /f /im powershell.exe /fi "WINDOWTITLE eq BlockAltTab" 2>nul
taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*" 2>nul
wmic process where "name='powershell.exe' and commandline like '%BlockAltTab%'" call terminate 2>nul

REM Удаление всех модификаций реестра
echo Восстановление настроек реестра...
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f 2>nul
reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f 2>nul

REM Удаление настроек Alt+Tab
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking" /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime" /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail" /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect" /f 2>nul

REM Восстановление настроек панели задач
echo Восстановление настроек панели задач...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAnimations /t REG_DWORD /d 1 /f

REM Восстановление настроек горячих углов и жестов
echo Восстановление горячих углов и жестов...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f

REM Восстановление центра уведомлений
echo Восстановление центра уведомлений...
reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f

REM Восстановление жестов тачпада
echo Восстановление жестов тачпада...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f

REM Восстановление StuckRects3
echo Восстановление настроек панели задач (StuckRects3)...
powershell -command "$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;Set-ItemProperty -Path $p -Name Settings -Value $v;" 2>nul

REM Удаляем все резервные копии
echo Удаление резервных копий...
reg delete "HKCU\\Software\\KioskAppBackup" /f 2>nul

REM Перезапуск проводника
echo Перезапуск проводника...
taskkill /f /im explorer.exe
timeout /t 2
start explorer.exe

echo Система восстановлена!
echo Если панель задач все еще не видна, перезагрузите компьютер.
pause
`;

    try {
        const scriptsDir = path.join(__dirname, '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, {recursive: true});
        }

        const restoreScriptPath = path.join(scriptsDir, 'EmergencySystemRestore.bat');
        fs.writeFileSync(restoreScriptPath, restoreScript);

        console.log(`Emergency restore script created at: ${restoreScriptPath}`);
        return restoreScriptPath;
    } catch (error) {
        console.error('Failed to create emergency restore script:', error);
        return '';
    }
}

/**
 * Force a complete system restoration (for emergency use)
 * @returns Promise that resolves to true if successful
 */
async function forceSystemRestore(): Promise<boolean> {
    return new Promise((resolve) => {
        const restoreScriptPath = createEmergencyRestoreScript();

        if (!restoreScriptPath) {
            console.error('Failed to create emergency restore script');
            resolve(false);
            return;
        }

        console.log('Executing emergency system restore...');

        // Здесь используем отдельный процесс без ожидания завершения,
        // чтобы не блокировать основной поток
        exec(`start cmd /c "${restoreScriptPath}"`, (error) => {
            if (error) {
                console.error('Failed to execute emergency restore script:', error);
                resolve(false);
            } else {
                console.log('Emergency restore script executed successfully');
                blockingActive = false;
                resolve(true);
            }
        });
    });
}

export function initWindowsKeyBlocker(options: WindowsKeyBlockerOptions = {}): WindowsKeyBlocker {
    const defaultOptions: WindowsKeyBlockerOptions = {
        useNativeHook: true,
        useAltTabBlocker: true,
        useElectronShortcuts: true,
        electronApp: null
    };

    const config = {...defaultOptions, ...options};

    createEmergencyRestoreScript();

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

        enableBlocker();
        enhanceKioskMode(true);

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

        blockingActive = true;
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

        disableBlocker();
        disableKioskMode(false);

        blockingActive = false;
        return results;
    }

    function isActive(): boolean {
        return blockingActive;
    }

    return {
        enable: enableBlocker,
        disable: disableBlocker,
        isActive,
        createEmergencyRestoreScript,
        forceSystemRestore
    };
}

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
};

createEmergencyRestoreScript();
