// native-win-blocker.js - JavaScript wrapper for native addon
const path = require('path');
let nativeBlocker;

try {
  // Try to load the native addon
  nativeBlocker = require('./build/Release/block_win_key.node');
  console.log('Native Windows key blocker loaded successfully');
} catch (err) {
  console.error('Failed to load native Windows key blocker:', err);
  nativeBlocker = null;
}

// Fallback implementation using PowerShell if native addon isn't available
function fallbackBlockWindowsKey() {
  const { exec } = require('child_process');
  const fs = require('fs');
  
  // PowerShell script to block Windows key
  const psScript = `
  # Block Windows key using PowerShell
  $code = @'
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
'@
  
  Add-Type -TypeDefinition $code -ReferencedAssemblies System.Windows.Forms
  [KeyBlocker]::Main()
  `;
  
  // Save the PowerShell script
  const scriptPath = path.join(__dirname, 'win-key-blocker.ps1');
  fs.writeFileSync(scriptPath, psScript);
  
  // Run the PowerShell script in hidden mode
  console.log('Starting PowerShell Windows key blocker...');
  exec(`powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}"`, (error) => {
    if (error) {
      console.error('Failed to start PowerShell key blocker:', error);
    } else {
      console.log('PowerShell Windows key blocker started');
    }
  });
  
  // Also apply registry modifications as backup
  console.log('Applying registry modifications to block Windows key...');
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f', (error) => {
    if (error) {
      console.error('Failed to set NoWinKeys registry key:', error);
    } else {
      console.log('NoWinKeys registry key set successfully');
    }
  });
}

// Function to start blocking Windows key
function startBlockingWindowsKey() {
  if (nativeBlocker) {
    // Use native addon if available
    const success = nativeBlocker.startKeyboardHook();
    console.log('Native Windows key blocking ' + (success ? 'started' : 'failed'));
    
    // Use fallback as backup even if native method is available
    fallbackBlockWindowsKey();
    return success;
  } else {
    // Use fallback PowerShell implementation
    fallbackBlockWindowsKey();
    return true;
  }
}

// Function to stop blocking Windows key
function stopBlockingWindowsKey() {
  if (nativeBlocker) {
    const success = nativeBlocker.stopKeyboardHook();
    console.log('Native Windows key blocking ' + (success ? 'stopped' : 'was not running'));
    return success;
  }
  return false;
}

module.exports = {
  startBlockingWindowsKey,
  stopBlockingWindowsKey
};
