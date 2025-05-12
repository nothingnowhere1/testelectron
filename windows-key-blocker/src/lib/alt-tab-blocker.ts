/**
 * Alt+Tab Blocker
 * 
 * Implements additional techniques to prevent Alt+Tab switching in Windows
 * using registry modifications, VBS scripts, and PowerShell scripts.
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Отслеживание запущенных процессов для корректной очистки
let powershellProcessId: string | null = null;
let backupCreated: boolean = false;

/**
 * Uses additional techniques to prevent Alt+Tab switching in Windows
 * @returns True if the operation was successful
 */
export function blockAltTabSwitching(): boolean {
  if (process.platform !== 'win32') return false;
  
  try {
    // Создаем резервную копию настроек перед модификацией
    createRegistryBackup();
    
    // Create a VBS script to disable Alt+Tab via registry
    createVbsScript();
    
    // Create a PowerShell script to further block Alt+Tab
    createPowershellBlocker();
    
    return true;
  } catch (error) {
    console.error('Error setting up Alt+Tab blocker:', error);
    return false;
  }
}

/**
 * Создает резервную копию настроек реестра
 */
function createRegistryBackup(): void {
  if (backupCreated) return;
  
  try {
    // Создаем директорию для резервных копий
    const backupDir = path.join(process.env.TEMP || '.', 'WindowsKeyBlockerBackup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Запускаем экспорт реестра для ключевых веток
    exec('reg export "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" "' + 
      path.join(backupDir, 'Explorer_Advanced.reg') + '" /y');
    
    backupCreated = true;
    console.log('Registry backup created');
  } catch (error) {
    console.error('Failed to create registry backup:', error);
  }
}

/**
 * Create a VBS script to disable Alt+Tab via Windows registry
 */
function createVbsScript(): void {
  const vbsContent = `
' DisableAltTab.vbs - Disables Alt+Tab functionality in Windows
Option Explicit

Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' Save original settings first (safer restoration)
On Error Resume Next
' Create backup directory
Dim fso, backupDir
Set fso = CreateObject("Scripting.FileSystemObject")
backupDir = WshShell.ExpandEnvironmentStrings("%TEMP%") & "\\WindowsKeyBlockerBackup"
If Not fso.FolderExists(backupDir) Then
    fso.CreateFolder(backupDir)
End If

' Backup important settings to files for safer restoration
WshShell.Run "reg export ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced"" """ & backupDir & "\\Explorer_Advanced_VBS.reg"" /y", 0, True

' Save specific values
WshShell.RegWrite "HKCU\\Software\\KioskAppBackup\\TaskbarSmallIcons", WshShell.RegRead("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons"), "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\KioskAppBackup\\IconsOnly", WshShell.RegRead("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\IconsOnly"), "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\KioskAppBackup\\TaskbarAnimations", WshShell.RegRead("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarAnimations"), "REG_DWORD"
On Error Goto 0

' Modify registry to disable Alt+Tab
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect", 0, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarAnimations", 0, "REG_DWORD"

' Do NOT modify these settings as they affect taskbar appearance
' WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", 1, "REG_DWORD"
' WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\IconsOnly", 1, "REG_DWORD"

' Create a restore script for emergency use
Dim restoreFile
restoreFile = backupDir & "\\RestoreAltTab.bat"
Set fso = CreateObject("Scripting.FileSystemObject")
Dim ts
Set ts = fso.CreateTextFile(restoreFile, True)
ts.WriteLine "@echo off"
ts.WriteLine "echo Restoring Alt+Tab functionality..."
ts.WriteLine "reg delete ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking"" /f"
ts.WriteLine "reg delete ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime"" /f"
ts.WriteLine "reg delete ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail"" /f"
ts.WriteLine "reg delete ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect"" /f"
ts.WriteLine "taskkill /f /im powershell.exe /fi ""WINDOWTITLE eq *BlockAltTab*"""
ts.WriteLine "echo Restarting explorer..."
ts.WriteLine "taskkill /f /im explorer.exe"
ts.WriteLine "timeout /t 2"
ts.WriteLine "start explorer.exe"
ts.WriteLine "echo Alt+Tab functionality restored."
ts.Close

WScript.Echo "Alt+Tab blocking registry changes applied. Emergency restore script created at: " & restoreFile
  `;
  
  const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
  const vbsPath = path.join(scriptsDir, 'DisableAltTab.vbs');
  
  // Ensure scripts directory exists
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  fs.writeFileSync(vbsPath, vbsContent);
  
  // Run the VBS script
  exec(`cscript //nologo "${vbsPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing VBS script: ${error}`);
      return;
    }
    console.log(`VBS output: ${stdout}`);
  });
}

/**
 * Create a PowerShell script to intercept Alt+Tab
 */
function createPowershellBlocker(): void {
  const psContent = `
# PowerShell script to block Alt+Tab via keyboard hook
$scriptTitle = "BlockAltTab"
$host.UI.RawUI.WindowTitle = $scriptTitle

Add-Type @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.IO;
using System.Text;

public class AltTabBlocker {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_KEYUP = 0x0101;
    private const int WM_SYSKEYDOWN = 0x0104;
    private const int WM_SYSKEYUP = 0x0105;
    
    private static LowLevelKeyboardProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static bool _altKeyDown = false;
    private static int _processId;
    
    public static void Main() {
        _processId = Process.GetCurrentProcess().Id;
        
        // Write process ID to file for later termination
        string tempPath = Path.GetTempPath();
        string procIdFile = Path.Combine(tempPath, "WindowsKeyBlockerBackup", "AltTabBlockerPID.txt");
        
        // Create directory if it doesn't exist
        Directory.CreateDirectory(Path.Combine(tempPath, "WindowsKeyBlockerBackup"));
        
        // Write process ID to file
        File.WriteAllText(procIdFile, _processId.ToString());
        
        Console.WriteLine("Alt+Tab blocker started with Process ID: " + _processId);
        
        _hookID = SetHook(_proc);
        Application.Run();
        UnhookWindowsHookEx(_hookID);
    }
    
    private static IntPtr SetHook(LowLevelKeyboardProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }
    
    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
    
    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0) {
            int vkCode = Marshal.ReadInt32(lParam);
            
            // Track Alt key state
            if (vkCode == 0x12 || vkCode == 0xA4 || vkCode == 0xA5) { // Alt, Left Alt, Right Alt
                if (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN) {
                    _altKeyDown = true;
                } else if (wParam == (IntPtr)WM_KEYUP || wParam == (IntPtr)WM_SYSKEYUP) {
                    _altKeyDown = false;
                }
            }
            
            // Block Tab when Alt is pressed (Alt+Tab)
            if (_altKeyDown && vkCode == 0x09) { // Tab key
                return (IntPtr)1;
            }
            
            // Block Escape when Alt is pressed (Alt+Escape)
            if (_altKeyDown && vkCode == 0x1B) { // Escape key
                return (IntPtr)1;
            }
        }
        
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
    
    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
    
    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);
    
    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
    
    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);
}
"@ -ReferencedAssemblies System.Windows.Forms

# Start the key blocker
[AltTabBlocker]::Main()
  `;
  
  const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
  const psPath = path.join(scriptsDir, 'BlockAltTab.ps1');
  
  // Ensure scripts directory exists
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  fs.writeFileSync(psPath, psContent);
  
  // Run the PowerShell script in hidden window
  exec(`powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${psPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing PowerShell script: ${error}`);
      return;
    }
    
    // Сохраняем ID процесса для последующего завершения
    const backupDir = path.join(process.env.TEMP || '.', 'WindowsKeyBlockerBackup');
    const pidFile = path.join(backupDir, 'AltTabBlockerPID.txt');
    
    // Через секунду пытаемся прочитать файл с ID процесса
    setTimeout(() => {
      try {
        if (fs.existsSync(pidFile)) {
          powershellProcessId = fs.readFileSync(pidFile, 'utf8').trim();
          console.log(`PowerShell Alt+Tab blocker started with PID: ${powershellProcessId}`);
        }
      } catch (err) {
        console.error('Error reading PowerShell process ID:', err);
      }
    }, 1000);
  });
}

/**
 * Restore Alt+Tab functionality and fix taskbar appearance
 * @returns True if the operation was successful
 */
export function restoreAltTabSwitching(): boolean {
  if (process.platform !== 'win32') return false;
  
  console.log('Executing enhanced Alt+Tab functionality restoration');
  
  try {
    // Use additional methods for more thorough restoration
    // Terminate all PowerShell blockers first
    try {
      // Terminate by PID if known
      if (powershellProcessId) {
        exec(`taskkill /F /PID ${powershellProcessId}`);
        console.log(`PowerShell process ${powershellProcessId} terminated`);
        powershellProcessId = null;
      }
      
      // Terminate by window title (multiple patterns)
      exec('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq BlockAltTab" 2>nul');
      exec('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*" 2>nul');
      
      // Terminate by command line content
      exec('wmic process where "name=\'powershell.exe\' and commandline like \'%BlockAltTab%\'" call terminate 2>nul');
      exec('wmic process where "name=\'powershell.exe\' and commandline like \'%AltTabBlocker%\'" call terminate 2>nul');
      exec('wmic process where "name=\'powershell.exe\' and commandline like \'%windows-key-blocker%\'" call terminate 2>nul');
      
      // Force unhook keyboard hooks using PowerShell
      exec('powershell -Command "$sig = \'[DllImport(\\\"user32.dll\\\")] public static extern bool UnhookWindowsHookEx(IntPtr hHook);\' ; Add-Type -MemberDefinition $sig -Name Keyboard -Namespace Win32 ; try { [Win32.Keyboard]::UnhookWindowsHookEx([IntPtr]::Zero) } catch {}"');
    } catch (error) {
      console.error('Error during PowerShell process termination:', error);
    }
    
    // Create and run VBS script to restore original settings
    const restoreVbsContent = `
    ' RestoreSettings.vbs - Restores original Windows settings
    Option Explicit
    
    Dim WshShell
    Set WshShell = CreateObject("WScript.Shell")
    
    ' Delete registry modifications we made
    On Error Resume Next
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail"
    WshShell.RegDelete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect"
    
    ' Restore original settings from backup
    On Error Resume Next
    If WshShell.RegRead("HKCU\\Software\\KioskAppBackup\\TaskbarSmallIcons") <> "" Then
        WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", WshShell.RegRead("HKCU\\Software\\KioskAppBackup\\TaskbarSmallIcons"), "REG_DWORD"
    End If
    
    If WshShell.RegRead("HKCU\\Software\\KioskAppBackup\\IconsOnly") <> "" Then
        WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\IconsOnly", WshShell.RegRead("HKCU\\Software\\KioskAppBackup\\IconsOnly"), "REG_DWORD"
    End If
    
    If WshShell.RegRead("HKCU\\Software\\KioskAppBackup\\TaskbarAnimations") <> "" Then
        WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarAnimations", WshShell.RegRead("HKCU\\Software\\KioskAppBackup\\TaskbarAnimations"), "REG_DWORD"
    End If
    
    ' Default values if backup doesn't exist
    If Err.Number <> 0 Then
        On Error Resume Next
        ' These are Windows 10/11 default values
        WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", 0, "REG_DWORD"
        WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\IconsOnly", 0, "REG_DWORD"
        WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarAnimations", 1, "REG_DWORD"
    End If
    
    ' Clean up our backup
    On Error Resume Next
    WshShell.RegDelete "HKCU\\Software\\KioskAppBackup\\TaskbarSmallIcons"
    WshShell.RegDelete "HKCU\\Software\\KioskAppBackup\\IconsOnly"
    WshShell.RegDelete "HKCU\\Software\\KioskAppBackup\\TaskbarAnimations"
    WshShell.RegDelete "HKCU\\Software\\KioskAppBackup\\"
    
    ' Fix specific taskbar size issue
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSizeMove", 1, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", 0, "REG_DWORD"
    WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarGlomLevel", 0, "REG_DWORD"
    
    ' Restart Explorer to apply changes
    On Error Resume Next
    WshShell.Run "taskkill /f /im explorer.exe", 0, True
    WshShell.Run "explorer.exe", 0, False
    
    WScript.Echo "Original settings restored"
    `;
    
    const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
    const restoreVbsPath = path.join(scriptsDir, 'RestoreSettings.vbs');
    
    // Ensure scripts directory exists
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    fs.writeFileSync(restoreVbsPath, restoreVbsContent);
    
    // Run the VBS script
    exec(`cscript //nologo "${restoreVbsPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing restore script: ${error}`);
      } else {
        console.log(`Restore output: ${stdout}`);
      }
    });
    
    // Если у нас есть ID процесса PowerShell, завершаем его
    if (powershellProcessId) {
      try {
        exec(`taskkill /F /PID ${powershellProcessId}`);
        console.log(`PowerShell process ${powershellProcessId} terminated`);
      } catch (error) {
        console.error(`Failed to terminate PowerShell process: ${error}`);
      }
      powershellProcessId = null;
    } else {
      // Если ID не сохранён, завершаем по оконному заголовку
      exec('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq BlockAltTab"');
    }
    
    // Завершаем все процессы PowerShell, которые могут содержать BlockAltTab в командной строке
    exec('wmic process where "name=\'powershell.exe\' and commandline like \'%BlockAltTab%\'" call terminate');
    
    // Apply additional fixes for taskbar size
    exec(`
      reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f
      reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f
      reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f
    `);
    
    // Восстанавливаем StuckRects3 для отображения панели задач
    exec(
      "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;}\"",
    );
    
    // Безопасно перезапускаем проводник с таймаутом
    exec("taskkill /f /im explorer.exe && timeout /t 2 && start explorer.exe");
    
    console.log('Alt+Tab functionality and taskbar appearance restored');
    return true;
  } catch (error) {
    console.error('Error restoring Alt+Tab functionality:', error);
    return false;
  }
}
