import { disableHotCorners, enableHotCorners } from './hot-corners';
import { disableActionCenter, enableActionCenter } from './notification';
import { disableTouchpadGestures, enableTouchpadGestures } from './touchpad';
import { blockWindowsKeyRegistry, restoreWindowsKeyRegistry } from './windows-keys';
import { hideTaskbar, showTaskbar } from './taskbar';


export function enhanceKioskMode(enable: boolean): boolean {
	if (process.platform !== 'win32') return false;

	if (enable) {

		blockWindowsKeyRegistry();
		disableHotCorners();
		disableActionCenter();
		hideTaskbar();
		disableTouchpadGestures();

		return true;
	} else {
		try {
			restoreWindowsKeyRegistry();
			enableHotCorners();
			enableActionCenter();
			showTaskbar();
			enableTouchpadGestures();

			return true;
		} catch (error) {
			console.error('Failed to disable kiosk mode:', error);
			return false;
		}
	}
}
