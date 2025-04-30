// preload.js
window.addEventListener('DOMContentLoaded', () => {
    // Block Windows key at DOM level
    document.addEventListener('keydown', (event) => {
        // Block Windows key (Meta/Super/OS key)
        if (event.key === 'Meta' || event.key === 'OS' || 
            event.code === 'MetaLeft' || event.code === 'MetaRight' ||
            event.keyCode === 91 || event.keyCode === 92) {
            event.preventDefault();
            console.log("Windows key blocked at DOM level");
            return false;
        }
    }, true); // true for capture phase to intercept before any other handlers
});
