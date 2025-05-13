import {exec} from "child_process";

function disableTouchpadGestures() {
    // Используем PowerShell для изменения реестра
    const command = `
    powershell.exe -Command "
      # Отключаем жесты тачпада через реестр
      $path = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad'
      
      # Проверяем существование пути
      if (!(Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
      }
      
      # Отключаем жесты
      Set-ItemProperty -Path $path -Name 'MultiFingerGestures' -Value 0
      Set-ItemProperty -Path $path -Name 'ThreeFingerGestures' -Value 0
      Set-ItemProperty -Path $path -Name 'FourFingerGestures' -Value 0
      
      Write-Host 'Жесты тачпада отключены.'
    "
  `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(stdout);
    });
}

// Функция для включения жестов тачпада
function enableTouchpadGestures() {
    const command = `
    powershell.exe -Command "
      # Включаем жесты тачпада через реестр
      $path = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad'
      
      # Проверяем существование пути
      if (!(Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
      }
      
      # Включаем жесты
      Set-ItemProperty -Path $path -Name 'MultiFingerGestures' -Value 1
      Set-ItemProperty -Path $path -Name 'ThreeFingerGestures' -Value 1
      Set-ItemProperty -Path $path -Name 'FourFingerGestures' -Value 1
      
      Write-Host 'Жесты тачпада включены.'
    "
  `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(stdout);
    });
}

disableTouchpadGestures();

setTimeout(enableTouchpadGestures, 10000);