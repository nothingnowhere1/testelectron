import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('powershell -command "&{$guid = (Get-ItemProperty \"HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad\").StatusFlag; Set-ItemProperty -Path \"HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad\" -Name \"StatusFlag\" -Value $(if ($guid -eq 1) {0} else {1})}"');

        exec('powershell -command "&{$service = Get-Service -Name \"TabletInputService\"; if ($service.Status -eq \"Running\") { Stop-Service -Name \"TabletInputService\" -Force } else { Start-Service -Name \"TabletInputService\" }}"');
        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        exec('powershell -command "&{$guid = (Get-ItemProperty \"HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad\").StatusFlag; Set-ItemProperty -Path \"HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad\" -Name \"StatusFlag\" -Value $(if ($guid -eq 1) {0} else {1})}"');

        exec('powershell -command "&{$service = Get-Service -Name \"TabletInputService\"; if ($service.Status -eq \"Running\") { Stop-Service -Name \"TabletInputService\" -Force } else { Start-Service -Name \"TabletInputService\" }}"');
        
        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}