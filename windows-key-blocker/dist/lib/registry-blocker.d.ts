/**
 * Windows Registry Blocker
 *
 * Implements Windows key blocking using registry modifications.
 * These techniques modify system settings to disable various
 * Windows hotkeys and shortcuts.
 */
/**
 * Block Windows key from opening Start menu using registry changes
 * @returns True if successful
 */
export declare function blockWindowsKeyRegistry(): boolean;
/**
 * Restore Windows key functionality by removing registry modifications
 * @returns True if successful
 */
export declare function restoreWindowsKeyRegistry(): boolean;
/**
 * Enhance kiosk mode with additional Windows-specific settings
 * @param enable True to enable kiosk mode enhancements, false to disable
 * @returns True if successful
 */
export declare function enhanceKioskMode(enable: boolean): boolean;
/**
 * Disable kiosk mode and restore normal Windows functionality
 * @param enable True to enable normal Windows functionality
 * @returns True if successful
 */
export declare function disableKioskMode(enable: boolean): boolean;
/**
 * Disable Windows 10/11 hot corners
 * @returns True if successful
 */
export declare function disableHotCorners(): boolean;
/**
 * Enable Windows 10/11 hot corners
 * @returns True if successful
 */
export declare function enableHotCorners(): boolean;
/**
 * Disable Windows task view
 * @returns True if successful
 */
export declare function disableTaskView(): boolean;
/**
 * Enable Windows task view
 * @returns True if successful
 */
export declare function enableTaskView(): boolean;
/**
 * Disable Windows Action Center
 * @returns True if successful
 */
export declare function disableActionCenter(): boolean;
/**
 * Enable Windows Action Center
 * @returns True if successful
 */
export declare function enableActionCenter(): boolean;
/**
 * Disable touchpad edge swipes
 * @returns True if successful
 */
export declare function disableTouchpadGestures(): boolean;
/**
 * Enable touchpad edge swipes
 * @returns True if successful
 */
export declare function enableTouchpadGestures(): boolean;
/**
 * Hide taskbar
 * @returns True if successful
 */
export declare function hideTaskbar(): boolean;
/**
 * Show taskbar
 * @returns True if successful
 */
export declare function showTaskbar(): boolean;
