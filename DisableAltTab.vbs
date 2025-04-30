
' DisableAltTab.vbs - Disables Alt+Tab functionality in Windows
Option Explicit

Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' Modify registry to disable Alt+Tab
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\DisallowShaking", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ExtendedUIHoverTime", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarNoThumbnail", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarSmallIcons", 1, "REG_DWORD"
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ListviewAlphaSelect", 0, "REG_DWORD"
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarAnimations", 0, "REG_DWORD"
WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\IconsOnly", 1, "REG_DWORD"

' Restart Explorer to apply changes
WshShell.Run "taskkill /f /im explorer.exe", 0, True
WshShell.Run "explorer.exe", 0, False

WScript.Echo "Alt+Tab blocking registry changes applied"
  