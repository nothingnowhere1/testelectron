// example-usage.js
// Пример использования модуля windows-key-blocker

// Импорт модуля
const { initWindowsKeyBlocker } = require('./windows-key-blocker');

// Создание экземпляра блокировщика
const winKeyBlocker = initWindowsKeyBlocker();

// Включение блокировки клавиши Windows и других системных комбинаций
console.log('Включение блокировки клавиши Windows...');
const result = winKeyBlocker.enable();
console.log('Результат включения блокировки:', result);

// Через 10 секунд выключаем блокировку
console.log('Через 10 секунд блокировка будет отключена...');
setTimeout(() => {
  console.log('Отключение блокировки клавиши Windows...');
  const disableResult = winKeyBlocker.disable();
  console.log('Результат отключения блокировки:', disableResult);
}, 10000);

// Примечание: этот файл можно запустить командой:
// node example-usage.js
