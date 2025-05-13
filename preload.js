// preload.js
const { ipcRenderer, contextBridge } = require('electron');

// Track if kiosk mode is active
let kioskMode = false;

// Expose key functionality to renderer process
contextBridge.exposeInMainWorld('kioskControl', {
    setKioskMode: (isKiosk) => {
        kioskMode = isKiosk;
    },
    isKioskMode: () => kioskMode
});

window.addEventListener('DOMContentLoaded', () => {
    // Block Windows key at DOM level only when in kiosk mode
    document.addEventListener('keydown', (event) => {
        // Only block keys when kiosk mode is active
        if (kioskMode) {
            // Block Windows key (Meta/Super/OS key)
            if (event.key === 'Meta' || event.key === 'OS' || 
                event.code === 'MetaLeft' || event.code === 'MetaRight' ||
                event.keyCode === 91 || event.keyCode === 92) {
                event.preventDefault();
                console.log("Windows key blocked at DOM level");
                return false;
            }
        }
    }, true); // true for capture phase to intercept before any other handlers
});
