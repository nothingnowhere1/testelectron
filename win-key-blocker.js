// win-key-blocker.js - Low level keyboard hook to block Windows key
const { exec } = require('child_process');

/**
 * Block Windows key completely using multiple methods
 */
function blockWindowsKeyCompletely() {
  console.log("Applying aggressive Windows key blocking...");
  
  try {
    // Method 1: Disable Start Menu completely through Registry
    exec(
      'reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f',
      (error) => {
        if (error) console.error("Failed to set NoWinKeys policy:", error);
        else console.log("NoWinKeys policy set");
      }
    );
    
    // Method 2: Remap Windows key to a non-functional key (more aggressive)
    // This binary value remaps left Windows key (0x5B) and right Windows key (0x5C) to nothing
    exec(
      'reg add "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /t REG_BINARY /d 00000000000000000300000000005BE000005CE000000000 /f',
      (error) => {
        if (error) console.error("Failed to remap Windows key scancode:", error);
        else console.log("Windows key scancode remapped");
      }
    );
    
    // Method 3: Create a SetWindowsHookEx equivalent using PowerShell
    // This creates a persistent script that runs in the background to block the Windows key
    const psScript = `
$hookCode = @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class KeyboardHook {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_KEYUP = 0x0101;
    private const int WM_SYSKEYDOWN = 0x0104;
    private const int WM_SYSKEYUP = 0x0105;
    
    private static LowLevelKeyboardProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    
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
            
            // Block Windows keys (Left: 91, Right: 92)
            if (vkCode == 91 || vkCode == 92) {
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
"@

Add-Type -TypeDefinition $hookCode -ReferencedAssemblies "System.Windows.Forms"
[KeyboardHook]::Main()
    `;
    
    // Save the script to a file
    const fs = require('fs');
    const path = require('path');
    const scriptPath = path.join(__dirname, 'win-key-blocker.ps1');
    fs.writeFileSync(scriptPath, psScript);
    
    // Run the PowerShell script in hidden mode
    exec(`powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}"`, (error) => {
      if (error) console.error("Failed to start PowerShell key blocker:", error);
      else console.log("PowerShell key blocker started");
    });
    
    // Method 4: Disable Explorer shell features that respond to Windows key
    exec(
      'reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f',
      (error) => {
        if (error) console.error("Failed to disable hotkeys:", error);
        else console.log("Hotkeys disabled");
      }
    );
    
    // Method 5: Modify keyboard layout to disable Windows key
    exec(
      'reg add "HKEY_CURRENT_USER\\Control Panel\\Keyboard" /v ScanCode Map /t REG_BINARY /d 00000000000000000300000000005BE000005CE000000000 /f',
      (error) => {
        if (error) console.error("Failed to modify keyboard layout:", error);
        else console.log("Keyboard layout modified");
      }
    );
    
    // Method 6: Create a scheduled task that kills the Start menu process when launched
    const taskCommand = `
    schtasks /create /tn "BlockStartMenu" /tr "taskkill /f /im StartMenuExperienceHost.exe" /sc MINUTE /mo 1 /f
    `;
    exec(taskCommand, (error) => {
      if (error) console.error("Failed to create StartMenu blocking task:", error);
      else console.log("StartMenu blocking task created");
    });
    
    return true;
  } catch (error) {
    console.error("Failed to apply Windows key blocking:", error);
    return false;
  }
}

module.exports = {
  blockWindowsKeyCompletely
};
