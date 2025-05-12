import {exec} from "child_process";

export function disableNotificationCenter(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 1 /f',
        );
        console.log("Notification Center disabled");
        return true;
    } catch (error) {
        console.error("Failed to disable Notification Center:", error);
        return false;
    }
}

export function enableNotificationCenter(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableNotificationCenter /t REG_DWORD /d 0 /f',
        );
        console.log("Notification Center enabled");
        return true;
    } catch (error) {
        console.error("Failed to enable Notification Center:", error);
        return false;
    }
}