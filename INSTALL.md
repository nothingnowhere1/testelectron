# Инструкция по установке модуля windows-key-blocker

## Предварительные требования

Для установки и использования модуля требуются:

- Node.js 14 или выше
- npm 6 или выше
- Windows 7/8/10/11
- Для сборки нативного аддона:
  - Python 2.7 или 3.x
  - Visual C++ Build Tools или Visual Studio
  - node-gyp (устанавливается глобально: `npm install -g node-gyp`)

## Установка из локального каталога

Если вы клонировали репозиторий или получили код модуля, выполните следующие шаги:

1. Перейдите в директорию модуля:
   ```
   cd windows-key-blocker
   ```

2. Установите зависимости:
   ```
   npm install
   ```

3. Скомпилируйте TypeScript код:
   ```
   npm run build
   ```

4. Соберите нативный аддон:
   ```
   node-gyp rebuild
   ```

5. Теперь модуль готов к использованию!

## Интеграция в ваш проект

Для использования модуля в вашем проекте, добавьте его как локальную зависимость:

1. В файле package.json вашего проекта добавьте зависимость:
   ```json
   "dependencies": {
     "windows-key-blocker": "file:./windows-key-blocker"
   }
   ```

2. Установите зависимость:
   ```
   npm install
   ```

3. Используйте модуль в вашем коде:
   ```javascript
   // JavaScript
   const { initWindowsKeyBlocker } = require('windows-key-blocker');
   
   const winKeyBlocker = initWindowsKeyBlocker();
   winKeyBlocker.enable();
   ```
   
   Или, если вы используете TypeScript:
   
   ```typescript
   // TypeScript
   import { initWindowsKeyBlocker } from 'windows-key-blocker';
   
   const winKeyBlocker = initWindowsKeyBlocker();
   winKeyBlocker.enable();
   ```

## Проверка работоспособности

Вы можете проверить работу модуля, запустив пример:

```
node example-usage.js
```

Этот пример включит блокировку клавиши Windows на 10 секунд, а затем отключит её.
