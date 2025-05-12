import {exec} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {hideTaskbar, showTaskbar} from "./taskbar";
import {disableHotCorners, enableHotCorners} from "./hot-corners";
import {disableNotificationCenter, enableNotificationCenter} from "./notification";
import {disableTouchpadGestures, enableTouchpadGestures} from "./touchpad";

function backupRegistrySettings(): void {
    try {
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

        const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, {recursive: true});
        }

        const backupVbsPath = path.join(scriptsDir, 'BackupSettings.vbs');
        fs.writeFileSync(backupVbsPath, backupVbsContent);

        exec(`cscript //nologo "${backupVbsPath}"`, (error, stdout) => {
            if (error) {
                console.error(`Error creating registry backup: ${error}`);
            } else {
                console.log(`Registry backup: ${stdout.trim()}`);
            }
        });
    } catch (error) {
        console.error('Failed to create registry backup:', error);
    }
}

export function blockWindowsKeyRegistry(): boolean {
    if (process.platform !== 'win32') return false;

    try {
        backupRegistrySettings();

        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f',
        );

        exec("taskkill /f /im explorer.exe && start explorer.exe");
        console.log("Windows key disabled from opening Start menu");
        return true;
    } catch (error) {
        console.error("Failed to block Windows key through registry:", error);
        return false;
    }
}

function createSystemRestoreScript(): void {
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

        const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, {recursive: true});
        }

        const restoreScriptPath = path.join(scriptsDir, 'RestoreWindowsSystem.bat');
        fs.writeFileSync(restoreScriptPath, restoreScript);

        console.log(`System restore script created at: ${restoreScriptPath}`);
    } catch (error) {
        console.error('Failed to create system restore script:', error);
    }
}

export function restoreWindowsKeyRegistry(): boolean {
    if (process.platform !== 'win32') return false;

    try {
        createSystemRestoreScript();

        exec(
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f',
        );
        exec(
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f',
        );
        exec(
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f',
        );

        // Scancode Map - может потребовать перезагрузку, поэтому пытаемся удалить, но не останавливаемся на ошибке
        exec(
            'reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f',
        );

        // Восстановление настроек панели задач
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f',
        );

        // Восстановление StuckRects3 для отображения панели задач
        exec(
            "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;}\"",
        );

        // Restart explorer to apply changes
        exec("taskkill /f /im explorer.exe && timeout /t 2 && start explorer.exe");

        // Use VBS to apply additional fixes
        createRestoreVbsScript();

        console.log("Windows key functionality restored");
        return true;
    } catch (error) {
        console.error("Failed to restore Windows key functionality:", error);
        return false;
    }
}

function createRestoreVbsScript(): void {
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
            fs.mkdirSync(scriptsDir, {recursive: true});
        }

        const restoreVbsPath = path.join(scriptsDir, 'CompleteRestore.vbs');
        fs.writeFileSync(restoreVbsPath, restoreVbsContent);

        // Run the VBS script
        exec(`cscript //nologo "${restoreVbsPath}"`, (error, stdout) => {
            if (error) {
                console.error(`Error executing restore script: ${error}`);
            } else {
                console.log(`Restore output: ${stdout}`);
            }
        });
    } catch (error) {
        console.error('Failed to create/execute VBS restore script:', error);
    }
}

export function enhanceKioskMode(enable: boolean): boolean {
    if (process.platform !== 'win32') return false;

    if (enable) {
        backupRegistrySettings();

        blockWindowsKeyRegistry();

        disableHotCorners();

        disableNotificationCenter();

        disableTouchpadGestures();

        hideTaskbar();

        return true;
    } else {
        try {
            createSystemRestoreScript();

            restoreWindowsKeyRegistry();

            enableHotCorners();

            enableNotificationCenter();

            enableTouchpadGestures();

            showTaskbar();

            // Перезапуск проводника для применения изменений
            exec("taskkill /f /im explorer.exe && timeout /t 2 && start explorer.exe");

            return true;
        } catch (error) {
            console.error("Failed to disable kiosk mode:", error);
            return false;
        }
    }
}

export function disableKioskMode(enable: boolean): boolean {
    return enhanceKioskMode(!enable);
}

