import {exec} from "child_process";

export function disableTouchpadGestures(): boolean {
    try {
        // Disable edge swipes
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 0 /f');

        // Disable three finger gestures
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 0 /f');

        // Disable four finger gestures
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 0 /f');

        exec('taskkill /f /im explorer.exe && start explorer.exe');
        console.log('Touchpad gestures disabled');
        return true;
    } catch (error) {
        console.error('Failed to disable touchpad gestures:', error);
        return false;
    }
}

export function enableTouchpadGestures(): boolean {
    try {
        // Enable edge swipes
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v EdgeSwipeEnabled /t REG_DWORD /d 1 /f');

        // Enable three finger gestures
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v ThreeFingerSlideEnabled /t REG_DWORD /d 1 /f');

        // Enable four finger gestures
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v FourFingerSlideEnabled /t REG_DWORD /d 1 /f');

        exec('taskkill /f /im explorer.exe && start explorer.exe');

        console.log('Touchpad gestures enabled');
        return true;
    } catch (error) {
        console.error('Failed to enable touchpad gestures:', error);
        return false;
    }
}