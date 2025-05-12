"use strict";
/**
 * Windows Registry Blocker
 *
 * Implements Windows key blocking using registry modifications.
 * These techniques modify system settings to disable various
 * Windows hotkeys and shortcuts.
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
exports.showTaskbar = exports.hideTaskbar = exports.enableTouchpadGestures = exports.disableTouchpadGestures = exports.enableActionCenter = exports.disableActionCenter = exports.enableTaskView = exports.disableTaskView = exports.enableHotCorners = exports.disableHotCorners = exports.disableKioskMode = exports.enhanceKioskMode = exports.restoreWindowsKeyRegistry = exports.blockWindowsKeyRegistry = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Флаг для отслеживания, были ли сделаны модификации реестра
let registryModified = false;
/**
 * Создает резервную копию реестра перед модификацией
 */
function backupRegistrySettings() {
    try {
        // Создаем VBS скрипт для резервного копирования важных настроек
        const backupVbsContent = `
    ' BackupSettings.vbs - Creates backup of important Windows settings
    Option Explicit
    
    Dim WshShell, fso, backupFile
    Set WshShell = CreateObject("WScript.Shell")
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    ' Create backup directory
    On Error Resume Next
    fso.CreateFolder(WshShell.ExpandEnvironmentStrings("%TEMP%") & "\\WindowsKeyBlockerBackup")
    
    ' Backup file path
    backupFile = WshShell.ExpandEnvironmentStrings("%TEMP%") & "\\WindowsKeyBlockerBackup\\registry_backup_" & Replace(Replace(Replace(Now(), ":", ""), "/", ""), " ", "_") & ".reg"
    
    ' Registry paths to backup
    Dim regPaths(5)
    regPaths(0) = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced"
    regPaths(1) = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3"
    regPaths(2) = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"
    regPaths(3) = "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer"
    regPaths(4) = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad"
    
    ' Execute export
    Dim cmd, i
    For i = 0 To UBound(regPaths)
        cmd = "reg export """ & regPaths(i) & """ """ & backupFile & "." & i & ".reg"" /y"
        WshShell.Run cmd, 0, True
    Next
    
    WScript.Echo "Registry backup created at: " & backupFile
    `;
        // Директория для скриптов
        const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        const backupVbsPath = path.join(scriptsDir, 'BackupSettings.vbs');
        fs.writeFileSync(backupVbsPath, backupVbsContent);
        // Запускаем скрипт для создания резервной копии
        (0, child_process_1.exec)(`cscript //nologo "${backupVbsPath}"`, (error, stdout) => {
            if (error) {
                console.error(`Error creating registry backup: ${error}`);
            }
            else {
                console.log(`Registry backup: ${stdout.trim()}`);
            }
        });
    }
    catch (error) {
        console.error('Failed to create registry backup:', error);
    }
}
/**
 * Block Windows key from opening Start menu using registry changes
 * @returns True if successful
 */
function blockWindowsKeyRegistry() {
    if (process.platform !== 'win32')
        return false;
    try {
        // Backup registry settings before modifications
        backupRegistrySettings();
        // Disable Windows key through registry
        // Method 1: Disable Start menu when Windows key is pressed
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f');
        // Method 2: Disable Windows key functionality completely
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f');
        // Method 3: Disable Start menu
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f');
        // Method 4: Remap Windows key scancode (more aggressive) - DISABLED due to potential issues
        // exec(
        //   'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /t REG_BINARY /d 00000000000000000300000000005BE000005CE000000000 /f',
        // );
        // Restart explorer to apply changes - MODIFIED to be less aggressive
        (0, child_process_1.exec)("taskkill /f /im explorer.exe && start explorer.exe");
        registryModified = true;
        console.log("Windows key disabled from opening Start menu");
        return true;
    }
    catch (error) {
        console.error("Failed to block Windows key through registry:", error);
        return false;
    }
}
exports.blockWindowsKeyRegistry = blockWindowsKeyRegistry;
/**
 * Создание и сохранение скрипта для полного восстановления системы
 */
function createSystemRestoreScript() {
    try {
        const restoreScript = `@echo off
echo Восстановление функциональности Windows...

REM Удаление всех модификаций реестра
echo Восстановление настроек реестра...
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f 2>nul
reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f 2>nul

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

REM Восстановление других настроек из резервной копии
echo Восстановление настроек из резервных копий...
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking" /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime" /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail" /f 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect" /f 2>nul

REM Восстановление StuckRects3
echo Восстановление настроек панели задач (StuckRects3)...
powershell -command "$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;Set-ItemProperty -Path $p -Name Settings -Value $v;"

REM Завершение процессов PowerShell, которые могут блокировать Alt+Tab
echo Завершение блокировщиков Alt+Tab...
taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*" 2>nul

REM Перезапуск проводника
echo Перезапуск проводника...
taskkill /f /im explorer.exe
timeout /t 2
start explorer.exe

echo Система восстановлена!
echo Если панель задач все еще не видна, перезагрузите компьютер.
`;
        // Директория для скриптов
        const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        // Сохраняем скрипт восстановления
        const restoreScriptPath = path.join(scriptsDir, 'RestoreWindowsSystem.bat');
        fs.writeFileSync(restoreScriptPath, restoreScript);
        console.log(`System restore script created at: ${restoreScriptPath}`);
    }
    catch (error) {
        console.error('Failed to create system restore script:', error);
    }
}
/**
 * Restore Windows key functionality by removing registry modifications
 * @returns True if successful
 */
function restoreWindowsKeyRegistry() {
    if (process.platform !== 'win32')
        return false;
    try {
        // Create system restore script for manual recovery
        createSystemRestoreScript();
        // Remove registry modifications
        (0, child_process_1.exec)('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f');
        (0, child_process_1.exec)('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f');
        (0, child_process_1.exec)('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f');
        // Scancode Map - может потребовать перезагрузку, поэтому пытаемся удалить, но не останавливаемся на ошибке
        (0, child_process_1.exec)('reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f');
        // Восстановление настроек панели задач
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f');
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f');
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f');
        // Восстановление StuckRects3 для отображения панели задач
        (0, child_process_1.exec)("powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;}\"");
        // Restart explorer to apply changes
        (0, child_process_1.exec)("taskkill /f /im explorer.exe && timeout /t 2 && start explorer.exe");
        // Use VBS to apply additional fixes
        createRestoreVbsScript();
        registryModified = false;
        console.log("Windows key functionality restored");
        return true;
    }
    catch (error) {
        console.error("Failed to restore Windows key functionality:", error);
        return false;
    }
}
exports.restoreWindowsKeyRegistry = restoreWindowsKeyRegistry;
/**
 * Create VBS script to properly restore system settings
 */
function createRestoreVbsScript() {
    try {
        const restoreVbsContent = `
    ' RestoreSettings.vbs - Restores original Windows settings
    Option Explicit
    
    Dim WshShell
    Set WshShell = CreateObject("WScript.Shell")
    
    ' Delete registry modifications we made
    On Error Resume Next
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisabledHotkeys"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer\\NoWinKeys"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer\\NoStartMenuMorePrograms"
    
    ' Delete all modifications
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect"
    
    ' Restore Windows 10/11 default values
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSizeMove", 1, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", 0, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\IconsOnly", 0, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarAnimations", 1, "REG_DWORD"
    
    ' Fix specific taskbar size issue
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSizeMove", 1, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", 0, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarGlomLevel", 0, "REG_DWORD"
    
    WScript.Echo "Original settings restored"
    `;
        const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        const restoreVbsPath = path.join(scriptsDir, 'CompleteRestore.vbs');
        fs.writeFileSync(restoreVbsPath, restoreVbsContent);
        // Run the VBS script
        (0, child_process_1.exec)(`cscript //nologo "${restoreVbsPath}"`, (error, stdout) => {
            if (error) {
                console.error(`Error executing restore script: ${error}`);
            }
            else {
                console.log(`Restore output: ${stdout}`);
            }
        });
    }
    catch (error) {
        console.error('Failed to create/execute VBS restore script:', error);
    }
}
/**
 * Enhance kiosk mode with additional Windows-specific settings
 * @param enable True to enable kiosk mode enhancements, false to disable
 * @returns True if successful
 */
function enhanceKioskMode(enable) {
    if (process.platform !== 'win32')
        return false;
    if (enable) {
        // Backup registry settings before modifications
        backupRegistrySettings();
        // Block Windows key opening Start menu
        blockWindowsKeyRegistry();
        // Disable Windows hot corners and gestures
        disableHotCorners();
        // Disable task view
        disableTaskView();
        // Disable Action Center
        disableActionCenter();
        // Disable touchpad edge swipes
        disableTouchpadGestures();
        // Optional: Hide taskbar completely (but now using a safer method)
        hideTaskbar();
        return true;
    }
    else {
        try {
            // First create a complete restore script for emergency use
            createSystemRestoreScript();
            // Restore Windows key functionality
            restoreWindowsKeyRegistry();
            // Restore Windows hot corners and gestures
            enableHotCorners();
            // Enable task view
            enableTaskView();
            // Enable Action Center
            enableActionCenter();
            // Enable touchpad edge swipes
            enableTouchpadGestures();
            // Show taskbar if it was hidden
            showTaskbar();
            // Перезапуск проводника для применения изменений
            (0, child_process_1.exec)("taskkill /f /im explorer.exe && timeout /t 2 && start explorer.exe");
            return true;
        }
        catch (error) {
            console.error("Failed to disable kiosk mode:", error);
            return false;
        }
    }
}
exports.enhanceKioskMode = enhanceKioskMode;
/**
 * Disable kiosk mode and restore normal Windows functionality
 * @param enable True to enable normal Windows functionality
 * @returns True if successful
 */
function disableKioskMode(enable) {
    return enhanceKioskMode(!enable);
}
exports.disableKioskMode = disableKioskMode;
/**
 * Disable Windows 10/11 hot corners
 * @returns True if successful
 */
function disableHotCorners() {
    try {
        // Disable peek
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 1 /f');
        // Disable task view
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f');
        // Disable Start menu corner
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 1 /f');
        console.log("Windows hot corners disabled");
        return true;
    }
    catch (error) {
        console.error("Failed to disable hot corners:", error);
        return false;
    }
}
exports.disableHotCorners = disableHotCorners;
/**
 * Enable Windows 10/11 hot corners
 * @returns True if successful
 */
function enableHotCorners() {
    try {
        // Enable peek
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f');
        // Enable task view
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f');
        // Enable Start menu corner
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f');
        console.log("Windows hot corners enabled");
        return true;
    }
    catch (error) {
        console.error("Failed to enable hot corners:", error);
        return false;
    }
}
exports.enableHotCorners = enableHotCorners;
/**
 * Disable Windows task view
 * @returns True if successful
 */
function disableTaskView() {
    try {
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 2 /f');
        console.log("Task view disabled");
        return true;
    }
    catch (error) {
        console.error("Failed to disable task view:", error);
        return false;
    }
}
exports.disableTaskView = disableTaskView;
/**
 * Enable Windows task view
 * @returns True if successful
 */
function enableTaskView() {
    try {
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f');
        console.log("Task view enabled");
        return true;
    }
    catch (error) {
        console.error("Failed to enable task view:", error);
        return false;
    }
}
exports.enableTaskView = enableTaskView;
/**
 * Disable Windows Action Center
 * @returns True if successful
 */
function disableActionCenter() {
    try {
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 1 /f');
        console.log("Action Center disabled");
        return true;
    }
    catch (error) {
        console.error("Failed to disable Action Center:", error);
        return false;
    }
}
exports.disableActionCenter = disableActionCenter;
/**
 * Enable Windows Action Center
 * @returns True if successful
 */
function enableActionCenter() {
    try {
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f');
        console.log("Action Center enabled");
        return true;
    }
    catch (error) {
        console.error("Failed to enable Action Center:", error);
        return false;
    }
}
exports.enableActionCenter = enableActionCenter;
/**
 * Disable touchpad edge swipes
 * @returns True if successful
 */
function disableTouchpadGestures() {
    try {
        // Disable edge swipes
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 0 /f');
        // Disable three finger gestures
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 0 /f');
        // Disable four finger gestures
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 0 /f');
        console.log("Touchpad gestures disabled");
        return true;
    }
    catch (error) {
        console.error("Failed to disable touchpad gestures:", error);
        return false;
    }
}
exports.disableTouchpadGestures = disableTouchpadGestures;
/**
 * Enable touchpad edge swipes
 * @returns True if successful
 */
function enableTouchpadGestures() {
    try {
        // Enable edge swipes
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f');
        // Enable three finger gestures
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f');
        // Enable four finger gestures
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f');
        console.log("Touchpad gestures enabled");
        return true;
    }
    catch (error) {
        console.error("Failed to enable touchpad gestures:", error);
        return false;
    }
}
exports.enableTouchpadGestures = enableTouchpadGestures;
/**
 * Hide taskbar
 * @returns True if successful
 */
function hideTaskbar() {
    try {
        // Более безопасный метод скрытия панели задач
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 1 /f');
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 0 /f');
        // Используем PowerShell для скрытия панели задач через StuckRects3
        // Но сохраняем флаг для восстановления
        (0, child_process_1.exec)("powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=3;&Set-ItemProperty -Path $p -Name Settings -Value $v;Stop-Process -f -ProcessName explorer;Start-Process explorer}\"");
        console.log("Taskbar hidden");
        return true;
    }
    catch (error) {
        console.error("Failed to hide taskbar:", error);
        return false;
    }
}
exports.hideTaskbar = hideTaskbar;
/**
 * Show taskbar
 * @returns True if successful
 */
function showTaskbar() {
    try {
        // Восстанавливаем размер панели задач
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f');
        (0, child_process_1.exec)('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f');
        // Используем PowerShell для отображения панели задач через StuckRects3
        (0, child_process_1.exec)("powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;Stop-Process -f -ProcessName explorer;Start-Process explorer}\"");
        console.log("Taskbar shown");
        return true;
    }
    catch (error) {
        console.error("Failed to show taskbar:", error);
        return false;
    }
}
exports.showTaskbar = showTaskbar;
