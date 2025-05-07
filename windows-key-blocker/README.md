# Windows Key Blocker

Комплексный модуль для блокировки клавиши Windows, комбинации Alt+Tab и других системных сочетаний клавиш в режиме киоска для Windows-приложений.

## Возможности

- Написан на TypeScript с полной типизацией
- Блокировка клавиши Windows (левой и правой) с использованием нативного C++ аддона
- Блокировка Alt+Tab и других системных комбинаций клавиш
- Оптимизация настроек реестра Windows для режима киоска
- Интеграция с приложениями Electron
- Улучшенный режим киоска с отключением горячих углов Windows, центра уведомлений и т.д.

## Установка

```bash
npm install windows-key-blocker
```

Для работы нативного аддона требуются:
- Windows 7+ (тестировался на Windows 10 и Windows 11)
- Node.js 14+
- Python и средства сборки для native addons (для установки C++ компонента)

## Использование

### Базовое использование (TypeScript)

```typescript
import { initWindowsKeyBlocker } from 'windows-key-blocker';

// Инициализация блокировщика со всеми методами
const winKeyBlocker = initWindowsKeyBlocker();

// Включение блокировки
winKeyBlocker.enable();

// ...

// Выключение блокировки
winKeyBlocker.disable();
```

### Использование с Electron

```typescript
import { app } from 'electron';
import { initWindowsKeyBlocker, WindowsKeyBlockerOptions } from 'windows-key-blocker';

// Передайте экземпляр app для регистрации глобальных сочетаний клавиш
const options: WindowsKeyBlockerOptions = {
  electronApp: app
};

const winKeyBlocker = initWindowsKeyBlocker(options);

app.whenReady().then(() => {
  // Включение блокировки
  winKeyBlocker.enable();
});

app.on('will-quit', () => {
  // Выключение блокировки при выходе
  winKeyBlocker.disable();
});
```

### Расширенные настройки

```typescript
import { initWindowsKeyBlocker, WindowsKeyBlockerOptions } from 'windows-key-blocker';
import { app } from 'electron';

// Настройка с определенными методами блокировки
const options: WindowsKeyBlockerOptions = {
  useNativeHook: true,        // Использовать нативный C++ hook
  useRegistry: true,          // Использовать модификации реестра
  useAltTabBlocker: true,     // Блокировать Alt+Tab
  useElectronShortcuts: true, // Использовать Electron глобальные сочетания
  electronApp: app            // Опционально для Electron
};

const winKeyBlocker = initWindowsKeyBlocker(options);

// Включение полного режима киоска с дополнительными улучшениями
winKeyBlocker.enhanceKioskMode(true);

// ...

// Отключение режима киоска и восстановление нормальной функциональности
winKeyBlocker.enhanceKioskMode(false);
```

### Прямой доступ к API

Вы также можете использовать отдельные функции напрямую:

```typescript
import {
  native,
  altTab,
  registry,
  electron
} from 'windows-key-blocker';

// Использование нативного блокировщика клавиши Windows
native.startBlockingWindowsKey();

// Блокировка Alt+Tab
altTab.blockAltTabSwitching();

// Улучшение режима киоска через реестр
registry.enhanceKioskMode(true);

// Отключение режима киоска
registry.disableKioskMode(false);
```

## API

### initWindowsKeyBlocker(options?: WindowsKeyBlockerOptions)

Инициализирует блокировщик клавиши Windows с указанными опциями.

**Параметры:**

- `options` (WindowsKeyBlockerOptions): Конфигурационные опции
  - `useNativeHook` (boolean): Использовать нативный C++ hook (по умолчанию: true)
  - `useRegistry` (boolean): Использовать модификации реестра (по умолчанию: true)
  - `useAltTabBlocker` (boolean): Блокировать Alt+Tab (по умолчанию: true)
  - `useElectronShortcuts` (boolean): Использовать Electron сочетания клавиш (по умолчанию: true)
  - `electronApp` (ElectronApp): Экземпляр Electron app (по умолчанию: null)

**Возвращает:** Объект типа WindowsKeyBlocker с методами управления блокировкой:

- `enable()`: Включает блокировку
- `disable()`: Отключает блокировку
- `enhanceKioskMode(enable: boolean)`: Включает/выключает расширенный режим киоска

### Прямой доступ к API

- `native`:
  - `startBlockingWindowsKey()`: Запускает нативный блокировщик
  - `stopBlockingWindowsKey()`: Останавливает нативный блокировщик

- `altTab`:
  - `blockAltTabSwitching()`: Блокирует Alt+Tab
  - `restoreAltTabSwitching()`: Восстанавливает Alt+Tab

- `registry`:
  - `blockWindowsKeyRegistry()`: Блокирует клавишу Windows через реестр
  - `restoreWindowsKeyRegistry()`: Восстанавливает функциональность
  - `enhanceKioskMode(enable: boolean)`: Улучшает режим киоска
  - `disableKioskMode(enable: boolean)`: Отключает режим киоска
  - ... и другие методы для управления настройками Windows

- `electron`:
  - `registerElectronShortcuts(app: ElectronApp)`: Регистрирует блокировку через Electron
  - `unregisterElectronShortcuts(app: ElectronApp)`: Отменяет регистрацию
  - `addBrowserWindowKeyHandlers(window: BrowserWindow)`: Добавляет обработчики клавиш для BrowserWindow

## Типы данных

```typescript
// Конфигурационные опции для блокировщика
interface WindowsKeyBlockerOptions {
  useNativeHook?: boolean;
  useRegistry?: boolean;
  useAltTabBlocker?: boolean;
  useElectronShortcuts?: boolean;
  electronApp?: any;
}

// Результаты операций блокировки
interface BlockerResults {
  nativeHook: boolean;
  registry: boolean;
  altTabBlocker: boolean;
  electronShortcuts: boolean;
}

// Интерфейс управления блокировкой
interface WindowsKeyBlocker {
  enable: () => BlockerResults;
  disable: () => BlockerResults;
  enhanceKioskMode: (enable: boolean) => boolean;
}
```

## Проблемы и ограничения

- Для некоторых функций требуются права администратора (особенно для работы с реестром)
- Ctrl+Alt+Del нельзя полностью заблокировать из-за ограничений безопасности Windows
- Для приложений Electron может потребоваться дополнительная настройка прав

## Разработка

Для сборки модуля из исходников выполните:

```bash
npm install
npm run build
```

## Лицензия

MIT
