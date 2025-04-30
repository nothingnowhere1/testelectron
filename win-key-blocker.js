// win-key-blocker.js - PowerShell and registry-based Windows key blocker
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Block Windows key completely using multiple methods
 */
function blockWindowsKeyCompletely() {
  console.log("Applying aggressive Windows key blocking...");
  
  try {
    // Create and execute a PowerShell script to block the Windows key
    setupPowerShellKeyBlocker();
    
    // Apply registry modifications to disable Windows key
    applyRegistryModifications();
    
    // Create a scheduled task to kill the Start menu process if it launches
    setupStartMenuBlockingTask();
    
    return true;
  } catch (error) {
    console.error("Failed to apply Windows key blocking:", error);
    return false;
  }
}

/**
 * Setup PowerShell key blocker
 */
function setupPowerShellKeyBlocker() {
  try {
    // PowerShell script to block Windows key
    const psScript = `
    # Block Windows key using PowerShell
    Add-Type -TypeDefinition @"
    using System;
    using System.Diagnostics;
    using System.Runtime.InteropServices;
    using System.Windows.Forms;
    
    public class KeyBlocker {
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        
        private static IntPtr _hookID = IntPtr.Zero;
        private static readonly LowLevelKeyboardProc _proc = HookCallback;
        
        public static void Main() {
            _hookID = SetHook(_proc);
            Application.Run();
        }
        
        private static IntPtr SetHook(LowLevelKeyboardProc proc) {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule) {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }
        
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
        
        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
            if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
                int vkCode = Marshal.ReadInt32(lParam);
                
                // VK_LWIN = 0x5B (Left Windows key)
                // VK_RWIN = 0x5C (Right Windows key)
                if (vkCode == 0x5B || vkCode == 0x5C) {
                    return (IntPtr)1; // Block the Windows key
                }
            }
            
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
        
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);
    }
"@ -ReferencedAssemblies System.Windows.Forms

    # Run the key blocker
    [KeyBlocker]::Main()
    `;
    
    // Save the PowerShell script
    const scriptPath = path.join(__dirname, 'win-key-blocker.ps1');
    fs.writeFileSync(scriptPath, psScript);
    
    // Launch PowerShell script in hidden window
    exec(`powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}"`, (error) => {
      if (error) {
        console.error("Failed to start PowerShell key blocker:", error);
      } else {
        console.log("PowerShell Windows key blocker started");
      }
    });
  } catch (error) {
    console.error("Failed to set up PowerShell key blocker:", error);
  }
}

/**
 * Apply registry modifications to disable Windows key
 */
function applyRegistryModifications() {
  try {
    // Method 1: Disable Windows key through NoWinKeys policy
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f',
      (error) => {
        if (error) console.error("Failed to set NoWinKeys policy:", error);
        else console.log("NoWinKeys policy set");
      }
    );
    
    // Method 2: Disable Start menu when Windows key is pressed
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f',
      (error) => {
        if (error) console.error("Failed to disable hotkeys:", error);
        else console.log("Windows key hotkeys disabled");
      }
    );
    
    // Method 3: Disable Start menu more programs
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f',
      (error) => {
        if (error) console.error("Failed to disable Start menu more programs:", error);
        else console.log("Start menu more programs disabled");
      }
    );
    
    // Method 4: Disable Start menu completely
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenu /t REG_DWORD /d 1 /f',
      (error) => {
        if (error) console.error("Failed to disable Start menu:", error);
        else console.log("Start menu disabled through registry");
      }
    );
    
    // Method 5: Try to disable the Start menu button
    exec(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowButton /t REG_DWORD /d 0 /f',
      (error) => {
        if (error) console.error("Failed to hide Start button:", error);
        else console.log("Start button hidden through registry");
      }
    );
    
    // Restart explorer to apply changes
    exec("taskkill /f /im explorer.exe && start explorer.exe", (error) => {
      if (error) console.error("Failed to restart explorer:", error);
      else console.log("Explorer restarted to apply registry changes");
    });
  } catch (error) {
    console.error("Failed to apply registry modifications:", error);
  }
}

/**
 * Set up a task to kill Start menu process if it launches
 */
function setupStartMenuBlockingTask() {
  try {
    // Create a batch file to kill the Start menu process
    const batchContent = `
@echo off
:loop
taskkill /f /im StartMenuExperienceHost.exe >nul 2>&1
timeout /t 1 >nul
goto loop
`;
    
    const batchPath = path.join(__dirname, 'kill-startmenu.bat');
    fs.writeFileSync(batchPath, batchContent);
    
    // Run the batch file in hidden window
    exec(`start /min "" "${batchPath}"`, (error) => {
      if (error) console.error("Failed to start Start menu blocking task:", error);
      else console.log("Start menu blocking task started");
    });
  } catch (error) {
    console.error("Failed to set up Start menu blocking task:", error);
  }
}

/**
 * Restore Windows key functionality
 */
function restoreWindowsKeyFunctionality() {
  try {
    // Remove registry modifications
    exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f');
    exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f');
    exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f');
    exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenu /f');
    exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowButton /t REG_DWORD /d 1 /f');
    
    // Kill any running blocking scripts
    exec('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *win-key-blocker*"');
    exec('taskkill /f /im cmd.exe /fi "WINDOWTITLE eq *kill-startmenu*"');
    
    // Restart explorer
    exec("taskkill /f /im explorer.exe && start explorer.exe");
    
    console.log("Windows key functionality restored");
    return true;
  } catch (error) {
    console.error("Failed to restore Windows key functionality:", error);
    return false;
  }
}

module.exports = {
  blockWindowsKeyCompletely,
  restoreWindowsKeyFunctionality
};
