@echo off
echo Emergency Windows Functionality Restoration
echo =======================================
echo.

echo Step 1: Kill all blocker processes
taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *BlockAltTab*" 2>nul
taskkill /f /im powershell.exe /fi "WINDOWTITLE eq BlockAltTab" 2>nul
wmic process where "name='powershell.exe' and commandline like '%%BlockAltTab%%'" call terminate 2>nul
wmic process where "name='powershell.exe' and commandline like '%%AltTabBlocker%%'" call terminate 2>nul
wmic process where "name='powershell.exe' and commandline like '%%windows-key-blocker%%'" call terminate 2>nul

echo Step 2: Remove all registry modifications
REM Remove Windows key blocking registry keys
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v DisabledHotkeys /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoWinKeys /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoStartMenuMorePrograms /f 2>nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Control\Keyboard Layout" /v "Scancode Map" /f 2>nul

REM Remove Alt+Tab blocking registry keys
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\DisallowShaking" /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ExtendedUIHoverTime" /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarNoThumbnail" /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ListviewAlphaSelect" /f 2>nul

REM Remove backup settings
reg delete "HKCU\Software\KioskAppBackup" /f 2>nul

echo Step 3: Restore default Windows settings
REM Restore taskbar settings
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarAnimations /t REG_DWORD /d 1 /f

REM Restore hot corners and gestures
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f

REM Restore notifications center
reg add "HKCU\Software\Policies\Microsoft\Windows\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f

REM Restore touchpad gestures
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f

echo Step 4: Reset keyboard hooks
powershell -Command "$sig = '[DllImport(\"user32.dll\")] public static extern bool UnhookWindowsHookEx(IntPtr hHook);' ; Add-Type -MemberDefinition $sig -Name Keyboard -Namespace Win32 ; try { [Win32.Keyboard]::UnhookWindowsHookEx([IntPtr]::Zero) } catch {}"

echo Step 5: Fix StuckRects3 settings for taskbar
powershell -Command "$p='HKCU:SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3'; if (Test-Path $p) { $v=(Get-ItemProperty -Path $p).Settings; $v[8]=2; Set-ItemProperty -Path $p -Name Settings -Value $v; }"

echo Step 6: Reset Explorer and other Windows services
taskkill /f /im explorer.exe
timeout /t 3

REM Reset Windows input settings
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v "Flags" /t REG_DWORD /d 0 /f
reg add "HKCU\Control Panel\Accessibility\ToggleKeys" /v "Flags" /t REG_DWORD /d 0 /f
reg add "HKCU\Control Panel\Accessibility\StickyKeys" /v "Flags" /t REG_DWORD /d 0 /f
reg add "HKCU\Control Panel\Accessibility\FilterKeys" /v "Flags" /t REG_DWORD /d 0 /f

echo Step 7: Fix keyboard scan codes
reg delete "HKLM\SYSTEM\CurrentControlSet\Control\Keyboard Layout" /v "Scancode Map" /f 2>nul

echo Step 8: Start Explorer again
start explorer.exe

echo =======================================
echo Emergency restoration completed!
echo If keyboard functionality is still not working correctly, please restart your computer.
echo.
pause
