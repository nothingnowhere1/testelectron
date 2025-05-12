import {exec} from "child_process";

export function enableTouchpadGestures(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f',
        );

        console.log("Touchpad gestures enabled");
        return true;
    } catch (error) {
        console.error("Failed to enable touchpad gestures:", error);
        return false;
    }
}

export function disableTouchpadGestures(): boolean {
    try {
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 0 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 0 /f',
        );
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 0 /f',
        );

        console.log("Touchpad gestures disabled");
        return true;
    } catch (error) {
        console.error("Failed to disable touchpad gestures:", error);
        return false;
    }
}