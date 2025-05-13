import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('powershell -command "&{Stop-Process -f -ProcessName dwm;}"');
        console.log('Taskbar hidden');
        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        exec('powershell -command "&{Stop-Process -f -ProcessName dwm;}"');

        console.log('Taskbar shown');
        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}