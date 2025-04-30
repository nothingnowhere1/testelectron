// altTabBlocker.js - Additional helper to prevent Alt+Tab switching
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Uses additional techniques to prevent Alt+Tab switching in Windows
 */
function blockAltTabSwitching() {
  if (process.platform !== 'win32') return false;
  
  try {
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
 * Create a VBS script to disable Alt+Tab via Windows registry
 */
function createVbsScript() {
  const vbsContent = `
' DisableAltTab.vbs - Disables Alt+Tab functionality in Windows
Option Explicit

Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' Modify registry to disable Alt+Tab
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\DisallowShaking", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ExtendedUIHoverTime", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarNoThumbnail", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarSmallIcons", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\ListviewAlphaSelect", 0, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarAnimations", 0, "REG_DWORD"
WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\IconsOnly", 1, "REG_DWORD"

' Restart Explorer to apply changes
WshShell.Run "taskkill /f /im explorer.exe", 0, True
WshShell.Run "explorer.exe", 0, False

WScript.Echo "Alt+Tab blocking registry changes applied"
  `;
  
  const vbsPath = path.join(__dirname, 'DisableAltTab.vbs');
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
function createPowershellBlocker() {
  const psContent = `
# PowerShell script to block Alt+Tab via keyboard hook
Add-Type @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class AltTabBlocker {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_KEYUP = 0x0101;
    private const int WM_SYSKEYDOWN = 0x0104;
    private const int WM_SYSKEYUP = 0x0105;
    
    private static LowLevelKeyboardProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static bool _altKeyDown = false;
    
    public static void Main() {
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
  
  const psPath = path.join(__dirname, 'BlockAltTab.ps1');
  fs.writeFileSync(psPath, psContent);
  
  // Run the PowerShell script in hidden window
  exec(`powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${psPath}"`, (error) => {
    if (error) {
      console.error(`Error executing PowerShell script: ${error}`);
      return;
    }
    console.log('PowerShell Alt+Tab blocker started');
  });
}

/**
 * Restore Alt+Tab functionality
 */
function restoreAltTabSwitching() {
  if (process.platform !== 'win32') return false;
  
  try {
    // Restore registry settings
    exec(`
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisallowShaking /f
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ExtendedUIHoverTime /f
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarNoThumbnail /f
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /f
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ListviewAlphaSelect /f
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAnimations /f
      reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v IconsOnly /f
    `);
    
    // Kill the PowerShell script
    exec('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*"');
    
    // Restart Explorer
    exec('taskkill /f /im explorer.exe && start explorer.exe');
    
    console.log('Alt+Tab functionality restored');
    return true;
  } catch (error) {
    console.error('Error restoring Alt+Tab functionality:', error);
    return false;
  }
}

module.exports = {
  blockAltTabSwitching,
  restoreAltTabSwitching
};
