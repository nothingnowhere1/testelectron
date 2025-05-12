/**
 * Alt+Tab Blocker
 * 
 * Simple module to block and unblock Alt+Tab functionality
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Track PowerShell process ID
let powershellPid = null;

/**
 * Block Alt+Tab functionality
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function blockAltTab() {
  console.log('Blocking Alt+Tab...');
  
  if (process.platform !== 'win32') {
    console.log('Alt+Tab blocking only supported on Windows');
    return false;
  }
  
  try {
    // Method 1: Registry modifications
    await execPromise('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisallowShaking" /t REG_DWORD /d 1 /f');
    await execPromise('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarNoThumbnail" /t REG_DWORD /d 1 /f');
    await execPromise('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ExtendedUIHoverTime" /t REG_DWORD /d 1 /f');
    await execPromise('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ListviewAlphaSelect" /t REG_DWORD /d 0 /f');
    
    // Method 2: Create PowerShell blocker script with keyboard hooks
    const psScript = createAltTabBlockerScript();
    const scriptPath = path.join(os.tmpdir(), 'BlockAltTab.ps1');
    fs.writeFileSync(scriptPath, psScript);
    
    // Execute PowerShell script in hidden window
    const command = `powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error starting PowerShell blocker:', error);
      } else {
        console.log('PowerShell Alt+Tab blocker started');
        
        // Try to get the PowerShell process ID for later termination
        exec('wmic process where "commandline like \'%BlockAltTab%\'" get processid', (err, out) => {
          if (!err && out) {
            const match = out.match(/(\d+)/);
            if (match && match[1]) {
              powershellPid = match[1];
              console.log(`Alt+Tab blocker PowerShell PID: ${powershellPid}`);
            }
          }
        });
      }
    });
    
    console.log('Alt+Tab blocked successfully');
    return true;
  } catch (error) {
    console.error('Error blocking Alt+Tab:', error);
    return false;
  }
}

/**
 * Unblock Alt+Tab functionality
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function unblockAltTab() {
  console.log('Unblocking Alt+Tab...');
  
  if (process.platform !== 'win32') {
    console.log('Alt+Tab unblocking only supported on Windows');
    return false;
  }
  
  try {
    // Remove registry modifications
    await execPromise('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisallowShaking" /f');
    await execPromise('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarNoThumbnail" /f');
    await execPromise('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ExtendedUIHoverTime" /f');
    await execPromise('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ListviewAlphaSelect" /f');
    
    // Kill PowerShell process if we have the PID
    if (powershellPid) {
      await execPromise(`taskkill /F /PID ${powershellPid}`);
      powershellPid = null;
    }
    
    // Kill all PowerShell processes related to Alt+Tab blocking as a fallback
    await execPromise('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq BlockAltTab" 2>nul');
    await execPromise('taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*" 2>nul');
    await execPromise('wmic process where "name=\'powershell.exe\' and commandline like \'%BlockAltTab%\'" call terminate 2>nul');
    
    // Unhook keyboard hooks using PowerShell
    const unhookCommand = 'powershell -Command "$sig = \'[DllImport(\\\"user32.dll\\\")] public static extern bool UnhookWindowsHookEx(IntPtr hHook);\' ; Add-Type -MemberDefinition $sig -Name Keyboard -Namespace Win32 ; try { [Win32.Keyboard]::UnhookWindowsHookEx([IntPtr]::Zero) } catch {}"';
    await execPromise(unhookCommand);
    
    console.log('Alt+Tab unblocked successfully');
    return true;
  } catch (error) {
    console.error('Error unblocking Alt+Tab:', error);
    return false;
  }
}

/**
 * Helper function to promisify exec
 */
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

/**
 * Create PowerShell script content to block Alt+Tab
 */
function createAltTabBlockerScript() {
  return `
# PowerShell script to block Alt+Tab via keyboard hook
$host.UI.RawUI.WindowTitle = "BlockAltTab"

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
}

module.exports = {
  blockAltTab,
  unblockAltTab
};
