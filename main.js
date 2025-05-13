// main.js

const {app, BrowserWindow, ipcMain, globalShortcut, screen, dialog} = require('electron');
const path = require('path');

// Импортируем наш новый модуль для блокировки Windows клавиши
const {initWindowsKeyBlocker} = require('windows-key-blocker');

let mainWindow;
let isKioskMode = false;
let winKeyBlocker;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Prevent new windows from being created
    mainWindow.webContents.setWindowOpenHandler(() => {
        return {action: 'deny'};
    });
}

// Enable kiosk mode
function enableKioskMode() {
    if (!mainWindow) return;

    isKioskMode = true;

    // Set window properties for kiosk mode
    mainWindow.setKiosk(true);

    // Set window bounds to cover the entire screen including taskbar
    const primaryDisplay = screen.getPrimaryDisplay();

    // Set window to cover entire screen including taskbar
    mainWindow.setPosition(0, 0);
    mainWindow.setSize(primaryDisplay.bounds.width, primaryDisplay.bounds.height);

    // Ensure window is above taskbar
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // Additional measures to prevent taskbar access
    mainWindow.setAutoHideMenuBar(true);

    // Инициализируем блокировщик Windows клавиши с полной конфигурацией
    if (!winKeyBlocker) {
        winKeyBlocker = initWindowsKeyBlocker({
            useNativeHook: true,
            useRegistry: true,
            useAltTabBlocker: true,
            useElectronShortcuts: true,
            electronApp: app
        });
    }

    // Активируем расширенный режим киоска (блокирует Windows клавишу и Alt+Tab)
    if (process.platform === 'win32') {
        try {
            // Создаем скрипт экстренного восстановления перед включением блокировки
            winKeyBlocker.createEmergencyRestoreScript();

            // Включаем все блокировки сразу
            winKeyBlocker.enable();
            console.log('Windows key blocker activated in enhanced kiosk mode');

            // Добавляем дополнительную блокировку на уровне окна браузера
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.on('before-input-event', (event, input) => {
                    // Block Windows key at browser level
                    if (input.key === 'Meta' || input.key === 'OS' || input.code === 'MetaLeft' || input.code === 'MetaRight') {
                        event.preventDefault();
                        console.log('Windows key blocked at browser level');
                        return false;
                    }

                    // Block Alt+Tab at browser level
                    if (input.altKey && input.key === 'Tab') {
                        event.preventDefault();
                        console.log('Alt+Tab blocked at browser level');
                        return false;
                    }
                });
            }
        } catch (error) {
            console.error('Failed to enable kiosk mode:', error);
            dialog.showErrorBox(
                'Ошибка активации режима киоска',
                'Произошла ошибка при активации режима киоска. Некоторые функции могут быть недоступны.'
            );
        }
    } else if (process.platform === 'darwin') {
        // macOS-specific key blocking
        try {
            globalShortcut.register('Command', () => {
                console.log('Command key blocked');
                return false;
            });
        } catch (error) {
            console.error('Failed to register Command key blocker:', error);
        }
    }

    mainWindow.setClosable(false);
    mainWindow.setFullScreen(true);
    mainWindow.setMenuBarVisibility(false);

    // Notify renderer process
    mainWindow.webContents.send('kiosk-mode-changed', true);
}

// Disable kiosk mode
function disableKioskMode() {
    if (!mainWindow) return;

    isKioskMode = false;

    // Reset window properties
    mainWindow.setKiosk(false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setClosable(true);
    mainWindow.setFullScreen(false);
    mainWindow.setMenuBarVisibility(true);

    // Отключаем блокировку Windows клавиши
    if (process.platform === 'win32' && winKeyBlocker) {
        try {
            // Сначала пробуем стандартное отключение
            const result = winKeyBlocker.disable();
            console.log('Windows key blocker deactivation result:', result);

            // Если после стандартного отключения блокировка все еще активна,
            // запускаем экстренное восстановление системы
            if (winKeyBlocker.isActive()) {
                console.log('Forcing system restore because blocker is still active');
                winKeyBlocker.forceSystemRestore()
                    .then(success => {
                        console.log('Emergency system restore completed with result:', success);
                    })
                    .catch(error => {
                        console.error('Error during emergency system restore:', error);
                    });
            }
        } catch (error) {
            console.error('Failed to disable kiosk mode:', error);
            console.log('Attempting emergency system restore...');

            // При ошибке сразу запускаем экстренное восстановление
            winKeyBlocker.forceSystemRestore()
                .then(success => {
                    console.log('Emergency system restore completed with result:', success);
                })
                .catch(error => {
                    console.error('Error during emergency system restore:', error);

                    // Показываем пользователю диалог с инструкциями
                    dialog.showErrorBox(
                        'Ошибка восстановления системы',
                        'Не удалось полностью восстановить функциональность Windows. Пожалуйста, выполните скрипт восстановления вручную: windows-key-blocker/scripts/EmergencySystemRestore.bat или перезагрузите компьютер.'
                    );
                });
        }
    }

    // Unregister all shortcuts
    globalShortcut.unregisterAll();

    // Notify renderer process
    mainWindow.webContents.send('kiosk-mode-changed', false);
}

// Handle IPC messages from renderer
ipcMain.on('toggle-kiosk-mode', (event, enable) => {
    if (enable) {
        enableKioskMode();
    } else {
        disableKioskMode();
    }
});

// Get current kiosk mode status
ipcMain.handle('get-kiosk-mode', () => {
    return isKioskMode;
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Clean up when app is quitting
app.on('will-quit', (event) => {
    globalShortcut.unregisterAll();

    // Также отключаем блокировку Windows клавиши при выходе
    if (process.platform === 'win32' && winKeyBlocker && winKeyBlocker.isActive()) {
        console.log('Disabling Windows key blocker on app exit');

        try {
            // Задерживаем выход на время отключения блокировки
            event.preventDefault();

            // Запускаем процесс восстановления
            winKeyBlocker.forceSystemRestore()
                .then(() => {
                    console.log('System restored successfully, quitting app');
                    app.exit(0);
                })
                .catch(error => {
                    console.error('Failed to restore system on exit:', error);
                    app.exit(1);
                });
        } catch (error) {
            console.error('Error during system restore on exit:', error);
        }
    }
});

// Prevent the app from exiting when in kiosk mode
app.on('before-quit', (event) => {
    if (isKioskMode) {
        event.preventDefault();

        // Спрашиваем пользователя, хочет ли он выйти
        dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['Отмена', 'Выйти'],
            defaultId: 0,
            title: 'Выход из режима киоска',
            message: 'Вы уверены, что хотите выйти из режима киоска?',
            cancelId: 0
        }).then(result => {
            if (result.response === 1) {
                // Отключаем режим киоска и разрешаем выход
                disableKioskMode();

                // Даем время на восстановление системы и затем выходим
                setTimeout(() => {
                    app.exit(0);
                }, 3000);
            }
        });
    }
});
