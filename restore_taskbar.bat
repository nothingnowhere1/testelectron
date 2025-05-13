@echo off
echo Taskbar Restoration Script
echo ========================
echo.

echo Step 1: Fixing StuckRects3 registry settings...
powershell -ExecutionPolicy Bypass -Command "$p='HKCU:SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3'; if (Test-Path $p) { $v=(Get-ItemProperty -Path $p).Settings; $v[8]=2; Set-ItemProperty -Path $p -Name Settings -Value $v; }"

echo Step 2: Restoring taskbar registry settings...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarAnimations /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v AutoHideTaskBar /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3" /v Settings /t REG_BINARY /d 30000000feffffff02030000000000003c0000002b0300000000000040060000af0000003c0000004005000030000000 /f

echo Step 3: Removing any auto-hide settings...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3" /v Settings /f
powershell -ExecutionPolicy Bypass -Command "& {$bytes = [byte[]](0x30,0x00,0x00,0x00,0xfe,0xff,0xff,0xff,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x3c,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0x06,0x00,0x00,0xaf,0x00,0x00,0x00,0x3c,0x00,0x00,0x00,0x00,0x05,0x00,0x00,0x30,0x00,0x00,0x00); New-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3' -Name 'Settings' -PropertyType Binary -Value $bytes -Force}"

echo Step 4: Ensuring explorer policy settings are correct...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoTrayItemsDisplay /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoAutoTrayNotify /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoTaskbarItemsDisplay /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v HideSCAHealth /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v HideSCANetwork /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v HideSCAPower /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v HideSCAVolume /f

echo Step 5: Deleting any auto-hide settings...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v AutoHideTaskBar /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3" /v Settings /f

echo Step 6: Re-adding default taskbar settings...
powershell -ExecutionPolicy Bypass -Command "& {$bytes = [byte[]](0x30,0x00,0x00,0x00,0xfe,0xff,0xff,0xff,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x3c,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0x06,0x00,0x00,0xaf,0x00,0x00,0x00,0x3c,0x00,0x00,0x00,0x00,0x05,0x00,0x00,0x30,0x00,0x00,0x00); New-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3' -Name 'Settings' -PropertyType Binary -Value $bytes -Force}"

echo Step 7: Restarting explorer to apply changes...
taskkill /f /im explorer.exe
timeout /t 3
start explorer.exe

echo.
echo Taskbar restoration completed!
echo If taskbar is still not visible, please restart your computer.
pause
