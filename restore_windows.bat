@echo off
echo Восстановление функциональности Windows...

REM Удаление всех модификаций реестра
echo Восстановление настроек реестра...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v DisabledHotkeys /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoWinKeys /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoStartMenuMorePrograms /f 2>nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Control\Keyboard Layout" /v "Scancode Map" /f 2>nul

REM Восстановление настроек панели задач
echo Восстановление настроек панели задач...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarAnimations /t REG_DWORD /d 1 /f

REM Восстановление настроек горячих углов и жестов
echo Восстановление горячих углов и жестов...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f

REM Восстановление центра уведомлений
echo Восстановление центра уведомлений...
reg add "HKCU\Software\Policies\Microsoft\Windows\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f

REM Восстановление жестов тачпада
echo Восстановление жестов тачпада...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f

REM Восстановление других настроек из резервной копии
echo Восстановление настроек из резервных копий...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\DisallowShaking" /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ExtendedUIHoverTime" /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarNoThumbnail" /f 2>nul
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ListviewAlphaSelect" /f 2>nul

REM Восстановление StuckRects3
echo Восстановление настроек панели задач (StuckRects3)...
powershell -command "$p='HKCU:SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;Set-ItemProperty -Path $p -Name Settings -Value $v;"

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
pause
