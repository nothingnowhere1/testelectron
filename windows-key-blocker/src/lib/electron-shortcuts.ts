import App = Electron.App;
import GlobalShortcut = Electron.GlobalShortcut;

const registerShortcuts = (): boolean => {

    try {
        const {globalShortcut} = require('electron') as { globalShortcut: GlobalShortcut };

        globalShortcut.register("Super", () => {
            console.log("Windows key (Super) blocked");
            return false;
        });

        globalShortcut.register("Super+L", () => {
            console.log("Left Windows key blocked");
            return false;
        });

        globalShortcut.register("Super+R", () => {
            console.log("Right Windows key blocked");
            return false;
        });

        globalShortcut.register("Meta", () => {
            console.log("Windows key (Meta) blocked");
            return false;
        });

        globalShortcut.register("LWin", () => {
            console.log("LWin key blocked");
            return false;
        });

        globalShortcut.register("RWin", () => {
            console.log("RWin key blocked");
            return false;
        });

        globalShortcut.register("Alt+Tab", () => {
            console.log("Alt+Tab blocked");
            return false;
        });

        globalShortcut.register("Alt+Escape", () => {
            console.log("Alt+Escape blocked");
            return false;
        });

        try {
            globalShortcut.register("Ctrl+Alt+Delete", () => {
                console.log("Attempted to block Ctrl+Alt+Delete");
                return false;
            });
        } catch (error) {
            console.log("Cannot block Ctrl+Alt+Delete: ", error);
        }

        globalShortcut.register("Super+D", () => false);
        globalShortcut.register("Super+E", () => false);
        globalShortcut.register("Super+F", () => false);
        globalShortcut.register("Super+Tab", () => false);

        globalShortcut.register("Alt+Esc", () => false);
        globalShortcut.register("Ctrl+Esc", () => false);

        const shortcuts = ["Alt+F4", "Alt+Tab", "Ctrl+Esc", "Ctrl+Shift+Esc", "F11", "Esc", "Tab", "Ctrl+W", "Alt+Space"];

        for (let i = 1; i <= 12; i++) {
            try {
                globalShortcut.register(`F${i}`, () => {
                    console.log(`F${i} is blocked in kiosk mode`);
                    return false;
                });
            } catch (error) {
                console.log(`Failed to register F${i}:`, error);
            }
        }

        shortcuts.forEach((shortcut) => {
            try {
                globalShortcut.register(shortcut, () => {
                    console.log(`${shortcut} is blocked in kiosk mode`);
                    return false;
                });
            } catch (error) {
                console.log(`Failed to register shortcut: ${shortcut}`, error);
            }
        });

        console.log('Electron shortcuts registered successfully');
        return true;
    } catch (error) {
        console.error('Failed to register Electron shortcuts:', error);
        return false;
    }
};

export function registerElectronShortcuts(electronApp: App): boolean {
    if (!electronApp) {
        console.error('Invalid Electron app instance provided');
        return false;
    }

    if (electronApp.isReady()) {
        registerShortcuts();
        return false;
    }

    return registerShortcuts();
}

export function unregisterElectronShortcuts(electronApp: App): boolean {
    if (!electronApp) {
        console.error('Invalid Electron app instance provided');
        return false;
    }

    try {
        const {globalShortcut} = require('electron') as { globalShortcut: GlobalShortcut };
        globalShortcut.unregisterAll();
        console.log('Electron shortcuts unregistered');
        return true;
    } catch (error) {
        console.error('Failed to unregister Electron shortcuts:', error);
        return false;
    }
}
