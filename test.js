import {exec} from "child_process";

// touchpadControl.js - Более эффективный скрипт для управления тачпадом
const {exec} = require('child_process');

// Функция для отключения тачпада
function disableTouchpad() {
    const command = `
    powershell.exe -Command "
      # Находим все устройства тачпада
      $touchpads = Get-PnpDevice | Where-Object {$_.Class -eq 'HIDClass' -and $_.FriendlyName -match '(touchpad|точечная панель|тачпад)'}
      
      if ($touchpads) {
        # Отключаем каждый найденный тачпад
        foreach ($device in $touchpads) {
          Disable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false
          Write-Host \"Тачпад '$($device.FriendlyName)' отключен.\"
        }
      } else {
        # Пробуем альтернативный метод поиска
        $touchpads = Get-PnpDevice | Where-Object {$_.Class -eq 'Mouse' -and $_.FriendlyName -match '(touchpad|точечная панель|тачпад)'}
        
        if ($touchpads) {
          foreach ($device in $touchpads) {
            Disable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false
            Write-Host \"Тачпад '$($device.FriendlyName)' отключен.\"
          }
        } else {
          Write-Host \"Не удалось найти устройство тачпада.\"
        }
      }
      
      # Дополнительно - попытка отключить через службу Synaptics если она существует
      try {
        $service = Get-Service -Name '*Synaptics*' -ErrorAction SilentlyContinue
        if ($service) {
          Stop-Service -Name $service.Name -Force
          Write-Host \"Служба Synaptics остановлена.\"
        }
      } catch {
        Write-Host \"Служба Synaptics не найдена или не может быть остановлена.\"
      }
    "
  `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка: ${error.message}`);
            return;
        }
        console.log(stdout);
    });
}

// Функция для включения тачпада
function enableTouchpad() {
    const command = `
    powershell.exe -Command "
      # Находим все устройства тачпада (даже отключенные)
      $touchpads = Get-PnpDevice | Where-Object {$_.Class -eq 'HIDClass' -and $_.FriendlyName -match '(touchpad|точечная панель|тачпад)'}
      
      if ($touchpads) {
        # Включаем каждый найденный тачпад
        foreach ($device in $touchpads) {
          Enable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false
          Write-Host \"Тачпад '$($device.FriendlyName)' включен.\"
        }
      } else {
        # Пробуем альтернативный метод поиска
        $touchpads = Get-PnpDevice | Where-Object {$_.Class -eq 'Mouse' -and $_.FriendlyName -match '(touchpad|точечная панель|тачпад)'}
        
        if ($touchpads) {
          foreach ($device in $touchpads) {
            Enable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false
            Write-Host \"Тачпад '$($device.FriendlyName)' включен.\"
          }
        } else {
          Write-Host \"Не удалось найти устройство тачпада.\"
        }
      }
      
      # Дополнительно - попытка запустить службу Synaptics если она существует
      try {
        $service = Get-Service -Name '*Synaptics*' -ErrorAction SilentlyContinue
        if ($service) {
          Start-Service -Name $service.Name
          Write-Host \"Служба Synaptics запущена.\"
        }
      } catch {
        Write-Host \"Служба Synaptics не найдена или не может быть запущена.\"
      }
    "
  `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка: ${error.message}`);
            return;
        }
        console.log(stdout);
    });
}

// Альтернативный метод через групповую политику (для некоторых версий Windows)
function disableTouchpadViaPolicy() {
    const command = `
    powershell.exe -Command "
      # Создаем путь для групповой политики если не существует
      $path = 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\EdgeUI'
      if (!(Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
      }
      
      # Отключаем жесты края экрана
      Set-ItemProperty -Path $path -Name 'AllowEdgeSwipe' -Value 0
      Write-Host 'Жесты края экрана отключены через групповую политику.'
      
      # Для Synaptics тачпадов также можно попробовать это
      $path2 = 'HKLM:\\SOFTWARE\\Synaptics\\SynTP\\TouchPadPS2'
      if (Test-Path $path2) {
        Set-ItemProperty -Path $path2 -Name 'EdgeMotionOptions' -Value 0
        Write-Host 'Synaptics TouchPad жесты отключены.'
      }
    "
  `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка: ${error.message}`);
            return;
        }
        console.log(stdout);
    });
}

// Включение через групповую политику
function enableTouchpadViaPolicy() {
    const command = `
    powershell.exe -Command "
      # Проверяем существование пути для групповой политики
      $path = 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\EdgeUI'
      if (Test-Path $path) {
        # Включаем жесты края экрана
        Set-ItemProperty -Path $path -Name 'AllowEdgeSwipe' -Value 1
        Write-Host 'Жесты края экрана включены через групповую политику.'
      }
      
      # Для Synaptics тачпадов также можно попробовать это
      $path2 = 'HKLM:\\SOFTWARE\\Synaptics\\SynTP\\TouchPadPS2'
      if (Test-Path $path2) {
        Set-ItemProperty -Path $path2 -Name 'EdgeMotionOptions' -Value 15
        Write-Host 'Synaptics TouchPad жесты включены.'
      }
    "
  `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка: ${error.message}`);
            return;
        }
        console.log(stdout);
    });
}

disableTouchpad();
disableTouchpadViaPolicy();

setTimeout(() => {
    enableTouchpad();
    enableTouchpadViaPolicy()
}, 10000);