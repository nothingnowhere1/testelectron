import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('powershell -command "&{Stop-Process -f -ProcessName explorer;Start-Process explorer}"');
        console.log('Taskbar hidden');
        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        // Используем PowerShell для отображения панели задач через StuckRects3
        exec('powershell -command "&{$p=\'HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3\';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;Stop-Process -f -ProcessName explorer;Start-Process explorer}"');

        console.log('Taskbar shown');
        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}