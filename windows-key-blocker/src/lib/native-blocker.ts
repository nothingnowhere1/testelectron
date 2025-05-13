interface NativeBlocker {
    startKeyboardHook: () => boolean;
    stopKeyboardHook: () => boolean;
}

let nativeBlocker: NativeBlocker | null = null;

try {
    nativeBlocker = require('bindings')('win_key_blocker');
    console.log('Native Windows key blocker loaded successfully');
} catch (err) {
    console.error('Failed to load native Windows key blocker:', err);
    nativeBlocker = null;
}

export function startBlockingWindowsKey(): boolean {
    if (nativeBlocker) {
        const success = nativeBlocker.startKeyboardHook();
        console.log('Native Windows key blocking ' + (success ? 'started' : 'failed'));
        return success;
    } else {
        console.error('Native Windows key blocker not available');
        return false;
    }
}

export function stopBlockingWindowsKey(): boolean {
    if (nativeBlocker) {
        const success = nativeBlocker.stopKeyboardHook();
        console.log('Native Windows key blocking ' + (success ? 'stopped' : 'was not running'));
        return success;
    }
    return false;
}
