import {exec} from "child_process";

export function disableHotCorners(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 1 /f',
        );

        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f',
        );

        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 1 /f',
        );

        console.log("Windows hot corners disabled");
        return true;
    } catch (error) {
        console.error("Failed to disable hot corners:", error);
        return false;
    }
}

export function enableHotCorners(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v DisablePreviewDesktop /t REG_DWORD /d 0 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 1 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_ShowClassicMode /t REG_DWORD /d 0 /f',
        );

        console.log("Windows hot corners enabled");
        return true;
    } catch (error) {
        console.error("Failed to enable hot corners:", error);
        return false;
    }
}