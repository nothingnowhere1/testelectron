import {exec} from "child_process";

export function blockWindowsKeyRegistry(): boolean {
    if (process.platform !== 'win32') return false;

    try {
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /t REG_SZ /d "LWin;RWin" /f');
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f');
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f');

        console.log('Windows key disabled from opening Start menu');
        return true;
    } catch (error) {
        console.error('Failed to block Windows key through registry:', error);
        return false;
    }
}

export function restoreWindowsKeyRegistry(): boolean {
    if (process.platform !== 'win32') return false;

    try {
        exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisabledHotkeys /f');
        exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoWinKeys /f');
        exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoStartMenuMorePrograms /f');

        console.log('Windows key functionality restored');
        return true;
    } catch (error) {
        console.error('Failed to restore Windows key functionality:', error);
        return false;
    }
}