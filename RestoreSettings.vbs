
    ' RestoreSettings.vbs - Restores original Windows settings
    Option Explicit
    
    Dim WshShell
    Set WshShell = CreateObject("WScript.Shell")
    
    ' Delete registry modifications we made
    On Error Resume Next
    WshShell.RegDelete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\DisallowShaking"
    WshShell.RegDelete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ExtendedUIHoverTime"
    WshShell.RegDelete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarNoThumbnail"
    WshShell.RegDelete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ListviewAlphaSelect"
    
    ' Restore original settings from backup
    On Error Resume Next
    If WshShell.RegRead("HKCU\Software\KioskAppBackup\TaskbarSmallIcons") <> "" Then
        WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarSmallIcons", WshShell.RegRead("HKCU\Software\KioskAppBackup\TaskbarSmallIcons"), "REG_DWORD"
    End If
    
    If WshShell.RegRead("HKCU\Software\KioskAppBackup\IconsOnly") <> "" Then
        WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\IconsOnly", WshShell.RegRead("HKCU\Software\KioskAppBackup\IconsOnly"), "REG_DWORD"
    End If
    
    If WshShell.RegRead("HKCU\Software\KioskAppBackup\TaskbarAnimations") <> "" Then
        WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarAnimations", WshShell.RegRead("HKCU\Software\KioskAppBackup\TaskbarAnimations"), "REG_DWORD"
    End If
    
    ' Default values if backup doesn't exist
    If Err.Number <> 0 Then
        On Error Resume Next
        ' These are Windows 10/11 default values
        WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarSmallIcons", 0, "REG_DWORD"
        WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\IconsOnly", 0, "REG_DWORD"
        WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarAnimations", 1, "REG_DWORD"
    End If
    
    ' Clean up our backup
    On Error Resume Next
    WshShell.RegDelete "HKCU\Software\KioskAppBackup\TaskbarSmallIcons"
    WshShell.RegDelete "HKCU\Software\KioskAppBackup\IconsOnly"
    WshShell.RegDelete "HKCU\Software\KioskAppBackup\TaskbarAnimations"
    WshShell.RegDelete "HKCU\Software\KioskAppBackup\"
    
    ' Fix specific taskbar size issue
    WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarSizeMove", 1, "REG_DWORD"
    WshShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarSmallIcons", 0, "REG_DWORD"
    
    ' Restart Explorer to apply changes
    On Error Resume Next
    WshShell.Run "taskkill /f /im explorer.exe", 0, True
    WshShell.Run "explorer.exe", 0, False
    
    WScript.Echo "Original settings restored"
    