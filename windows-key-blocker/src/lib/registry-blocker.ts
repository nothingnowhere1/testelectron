import {disableHotCorners, enableHotCorners} from './hot-corners';
import {disableActionCenter, enableActionCenter} from './notification';
import {disableTouchpadGestures, enableTouchpadGestures} from './touchpad';
import {blockWindowsKeyRegistry, restoreWindowsKeyRegistry} from './windows-keys';


export function enhanceKioskMode(enable: boolean): boolean {
    if (process.platform !== 'win32') return false;

    if (enable) {

        blockWindowsKeyRegistry();
        disableHotCorners();
        disableActionCenter();
        disableTouchpadGestures();

        return true;
    } else {
        try {
            restoreWindowsKeyRegistry();
            enableHotCorners();
            enableActionCenter();
            enableTouchpadGestures();

            return true;
        } catch (error) {
            console.error('Failed to disable kiosk mode:', error);
            return false;
        }
    }
}
