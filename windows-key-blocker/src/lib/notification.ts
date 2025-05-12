import {exec} from "child_process";

export function disableActionCenter(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 1 /f',
        );
        console.log("Action Center disabled");
        return true;
    } catch (error) {
        console.error("Failed to disable Action Center:", error);
        return false;
    }
}

export function enableActionCenter(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f',
        );
        console.log("Action Center enabled");
        return true;
    } catch (error) {
        console.error("Failed to enable Action Center:", error);
        return false;
    }
}