# Electron Kiosk Application

Приложение для режима киоска на основе Electron с расширенной блокировкой системных клавиш Windows.

## Новая структура проекта

Проект был переработан для использования модульного подхода. Функциональность блокировки клавиши Windows и других системных комбинаций клавиш теперь вынесена в отдельный TypeScript модуль `windows-key-blocker`.

### Основные компоненты:

- **main.js** - Основной процесс Electron
- **windows-key-blocker/** - Модуль для блокировки системных клавиш (TypeScript)

## Установка и запуск

1. Клонируйте репозиторий:
   ```bash
   git clone <url-репозитория>
   cd electron-kiosk-app
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```
   
   Это также автоматически установит и скомпилирует модуль `windows-key-blocker`.

3. Запустите приложение:
   ```bash
   npm start
   ```

4. Для разработки:
   ```bash
   npm run dev
   ```

## Модуль windows-key-blocker

Модуль `windows-key-blocker` предоставляет комплексное решение для блокировки системных клавиш в Windows:

- Блокировка клавиши Windows (левой и правой)
- Блокировка Alt+Tab и других системных комбинаций
- Блокировка через реестр Windows
- Блокировка через глобальные сочетания клавиш Electron
- Блокировка через нативный C++ аддон

### Использование модуля

```javascript
const { initWindowsKeyBlocker } = require('windows-key-blocker');

// Инициализация блокировщика
const winKeyBlocker = initWindowsKeyBlocker({
  useNativeHook: true,
  useRegistry: true,
  useAltTabBlocker: true,
  useElectronShortcuts: true,
  electronApp: app // Передаем экземпляр app для Electron
});

// Включение блокировки
winKeyBlocker.enable();

// Улучшенный режим киоска
winKeyBlocker.enhanceKioskMode(true);

// Отключение блокировки
winKeyBlocker.disable();
```

## Сборка приложения

Для создания исполняемого файла:

```bash
npm run build
```

## Важные замечания

- Некоторые функции блокировки требуют прав администратора в Windows
- Комбинацию Ctrl+Alt+Delete невозможно полностью заблокировать из-за ограничений безопасности Windows
