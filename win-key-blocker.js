// win-key-blocker.js - JavaScript wrapper for native addon
let nativeBlocker = null;

try {
  // Try to load the native addon using bindings for better error handling
  nativeBlocker = require('./bindings');
  console.log('Native Windows key blocker loaded successfully');
} catch (err) {
  console.error('Failed to load native Windows key blocker:', err);
  nativeBlocker = null;
}

// Function to start blocking Windows key
function startBlockingWindowsKey() {
  if (nativeBlocker) {
    // Use native addon if available
    const success = nativeBlocker.startKeyboardHook();
    console.log('Native Windows key blocking ' + (success ? 'started' : 'failed'));
    return success;
  } else {
    console.error('Native Windows key blocker not available');
    return false;
  }
}

// Function to stop blocking Windows key
function stopBlockingWindowsKey() {
  if (nativeBlocker) {
    const success = nativeBlocker.stopKeyboardHook();
    console.log('Native Windows key blocking ' + (success ? 'stopped' : 'was not running'));
    return success;
  }
  return false;
}

module.exports = {
  startBlockingWindowsKey,
  stopBlockingWindowsKey
};
