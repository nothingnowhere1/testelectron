"use strict";
/**
 * Windows Key Blocker Module
 *
 * A comprehensive module for blocking Windows key and other system shortcuts
 * in kiosk-mode applications. Includes both high-level and low-level hooks.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.electron = exports.registry = exports.altTab = exports.native = exports.initWindowsKeyBlocker = void 0;
const native_blocker_1 = require("./lib/native-blocker");
const alt_tab_blocker_1 = require("./lib/alt-tab-blocker");
const registry_blocker_1 = require("./lib/registry-blocker");
const electron_shortcuts_1 = require("./lib/electron-shortcuts");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
// Отслеживание текущего состояния блокировки
let blockingActive = false;
/**
 * Creates an emergency script to restore system functionality
 * @returns Path to the created script
 */
function createEmergencyRestoreScript() {
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
        // Создаем директорию для скриптов
        const scriptsDir = path.join(__dirname, '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        // Сохраняем скрипт восстановления
        const restoreScriptPath = path.join(scriptsDir, 'EmergencySystemRestore.bat');
        fs.writeFileSync(restoreScriptPath, restoreScript);
        console.log(`Emergency restore script created at: ${restoreScriptPath}`);
        return restoreScriptPath;
    }
    catch (error) {
        console.error('Failed to create emergency restore script:', error);
        return '';
    }
}
/**
 * Force a complete system restoration (for emergency use)
 * @returns Promise that resolves to true if successful
 */
async function forceSystemRestore() {
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
        (0, child_process_1.exec)(`start cmd /c "${restoreScriptPath}"`, (error) => {
            if (error) {
                console.error('Failed to execute emergency restore script:', error);
                resolve(false);
            }
            else {
                console.log('Emergency restore script executed successfully');
                blockingActive = false;
                resolve(true);
            }
        });
    });
}
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
    // Создаем скрипт экстренного восстановления при инициализации
    createEmergencyRestoreScript();
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
        blockingActive = true;
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
        console.log('Windows Key Blocker: Starting comprehensive restoration of all functionality');
        // First attempt: Standard restoration
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
        // Second attempt: Enhanced restoration for all functionality
        try {
            // Kill all blocker processes
            (0, child_process_1.exec)('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*" 2>nul');
            (0, child_process_1.exec)('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq BlockAltTab" 2>nul');
            (0, child_process_1.exec)('wmic process where "name=\'powershell.exe\' and commandline like \'%BlockAltTab%\'" call terminate 2>nul');
            (0, child_process_1.exec)('wmic process where "name=\'powershell.exe\' and commandline like \'%AltTabBlocker%\'" call terminate 2>nul');
            (0, child_process_1.exec)('wmic process where "name=\'powershell.exe\' and commandline like \'%windows-key-blocker%\'" call terminate 2>nul');
            // Reset keyboard hooks
            (0, child_process_1.exec)('powershell -Command "$sig = \'[DllImport(\\\"user32.dll\\\")] public static extern bool UnhookWindowsHookEx(IntPtr hHook);\' ; Add-Type -MemberDefinition $sig -Name Keyboard -Namespace Win32 ; try { [Win32.Keyboard]::UnhookWindowsHookEx([IntPtr]::Zero) } catch {}"');
            // Reset StuckRects3 settings for taskbar
            (0, child_process_1.exec)('powershell -Command "$p=\'HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3\'; if (Test-Path $p) { $v=(Get-ItemProperty -Path $p).Settings; $v[8]=2; Set-ItemProperty -Path $p -Name Settings -Value $v; }"');
            // Reset Windows input settings
            (0, child_process_1.exec)('reg add "HKCU\\Control Panel\\Accessibility\\Keyboard Response" /v "Flags" /t REG_DWORD /d 0 /f');
            (0, child_process_1.exec)('reg add "HKCU\\Control Panel\\Accessibility\\ToggleKeys" /v "Flags" /t REG_DWORD /d 0 /f');
            (0, child_process_1.exec)('reg add "HKCU\\Control Panel\\Accessibility\\StickyKeys" /v "Flags" /t REG_DWORD /d 0 /f');
            (0, child_process_1.exec)('reg add "HKCU\\Control Panel\\Accessibility\\FilterKeys" /v "Flags" /t REG_DWORD /d 0 /f');
            // Fix keyboard scan codes
            (0, child_process_1.exec)('reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f 2>nul');
            // Remove settings backup
            (0, child_process_1.exec)('reg delete "HKCU\\Software\\KioskAppBackup" /f 2>nul');
            // Restore touchpad gestures
            (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f');
            (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f');
            (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f');
            console.log('Windows Key Blocker: Enhanced restoration completed');
        }
        catch (error) {
            console.error('Windows Key Blocker: Enhanced restoration encountered errors:', error);
        }
        // Restart Explorer to apply all changes
        try {
            (0, child_process_1.exec)('taskkill /f /im explorer.exe && timeout /t 2 && start explorer.exe');
            console.log('Windows Key Blocker: Explorer restarted successfully');
        }
        catch (error) {
            console.error('Failed to restart explorer:', error);
        }
        blockingActive = false;
        return results;
    }
    function enhanceFullKioskMode(enable) {
        if (process.platform !== 'win32')
            return false;
        if (enable) {
            enableBlocker();
            (0, registry_blocker_1.enhanceKioskMode)(true);
            blockingActive = true;
            return true;
        }
        else {
            disableBlocker();
            (0, registry_blocker_1.disableKioskMode)(false);
            blockingActive = false;
            return true;
        }
    }
    function isActive() {
        return blockingActive;
    }
    return {
        enable: enableBlocker,
        disable: disableBlocker,
        enhanceKioskMode: enhanceFullKioskMode,
        isActive,
        createEmergencyRestoreScript,
        forceSystemRestore
    };
}
exports.initWindowsKeyBlocker = initWindowsKeyBlocker;
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
// Создаем экстренный скрипт восстановления при загрузке модуля 
// для обеспечения возможности восстановления даже при ошибках
createEmergencyRestoreScript();
