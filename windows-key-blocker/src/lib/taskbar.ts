import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('powershell -WindowStyle Hidden -Command "& {Stop-Process -Name explorer -Force; Start-Process explorer -ArgumentList \"/select,\\\"C:\\Windows\\explorer.exe\\\"\"}"');

        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        exec('powershell -WindowStyle Hidden -Command "& {Stop-Process -Name explorer -Force; Start-Process explorer -ArgumentList \"/select,\\\"C:\\Windows\\explorer.exe\\\"\"}"');

        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}