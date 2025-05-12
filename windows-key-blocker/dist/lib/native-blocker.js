"use strict";
/**
 * Native Windows Key Blocker
 *
 * Uses native C++ addon to implement low-level keyboard hooks for
 * blocking the Windows key and other system shortcuts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopBlockingWindowsKey = exports.startBlockingWindowsKey = void 0;
let nativeBlocker = null;
/**
 * Attempt to load the native addon with proper error handling
 */
try {
    // We use bindings to load the addon
    nativeBlocker = require('bindings')('win_key_blocker');
    console.log('Native Windows key blocker loaded successfully');
}
catch (err) {
    console.error('Failed to load native Windows key blocker:', err);
    nativeBlocker = null;
}
/**
 * Start blocking Windows key using native hooks
 * @returns True if successful, false otherwise
 */
function startBlockingWindowsKey() {
    if (nativeBlocker) {
        // Use native addon if available
        const success = nativeBlocker.startKeyboardHook();
        console.log('Native Windows key blocking ' + (success ? 'started' : 'failed'));
        return success;
    }
    else {
        console.error('Native Windows key blocker not available');
        return false;
    }
}
exports.startBlockingWindowsKey = startBlockingWindowsKey;
/**
 * Stop blocking Windows key
 * @returns True if successful, false otherwise
 */
function stopBlockingWindowsKey() {
    if (nativeBlocker) {
        const success = nativeBlocker.stopKeyboardHook();
        console.log('Native Windows key blocking ' + (success ? 'stopped' : 'was not running'));
        return success;
    }
    return false;
}
exports.stopBlockingWindowsKey = stopBlockingWindowsKey;
