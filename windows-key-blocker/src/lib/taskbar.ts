import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('rundll32.exe user32.dll,UpdatePerUserSystemParameters');
        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        exec('rundll32.exe user32.dll,UpdatePerUserSystemParameters');
        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}