#!/bin/bash

# Скрипт для удаления старых файлов, которые заменены новым модулем windows-key-blocker

echo "Удаление старых файлов, замененных модулем windows-key-blocker..."

# Удаляем файлы связанные с блокировкой Windows клавиши
rm -f win-key-blocker.js
rm -f bindings.js
rm -f binding.gyp
rm -f altTabBlocker.js
rm -f kiosk-helper.js
rm -f DisableAltTab.vbs
rm -f BlockAltTab.ps1

echo "Старые файлы удалены."
echo "Переработка проекта для использования нового модуля windows-key-blocker завершена."
