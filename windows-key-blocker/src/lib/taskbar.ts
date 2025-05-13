import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('powershell -command "&{(New-Object -ComObject Shell.Application).RestartWindows();}"');
        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        exec('powershell -command "&{(New-Object -ComObject Shell.Application).RestartWindows();}"');
        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}