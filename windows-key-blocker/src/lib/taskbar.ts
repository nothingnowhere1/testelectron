import {exec} from 'child_process';

export function hideTaskbar(): boolean {
    try {
        exec('powershell -Command "& {' +
            // Создаем временный VBS файл
            '$vbsContent = \\"Set WshShell = CreateObject(\\\\\\"WScript.Shell\\\\\\")\\r\\n' +
            'WshShell.Run \\\\\\"taskkill /f /im explorer.exe\\\\\\", 0, True\\r\\n' +
            'WScript.Sleep 100\\r\\n' +
            'WshShell.Run \\\\\\"explorer.exe /root,, /e,, /separate\\\\\\", 0, False\\r\\n\\"; ' +
            // Записываем скрипт во временный файл
            '$tempFile = [System.IO.Path]::GetTempFileName() + \\".vbs\\"; ' +
            '[System.IO.File]::WriteAllText($tempFile, $vbsContent); ' +
            // Запускаем скрипт без показа окон
            'Start-Process -FilePath \\"wscript.exe\\" -ArgumentList $tempFile -WindowStyle Hidden -Wait; ' +
            // Удаляем временный файл
            'Remove-Item $tempFile -Force' +
            '}"');

        return true;
    } catch (error) {
        console.error('Failed to hide taskbar:', error);
        return false;
    }
}

export function showTaskbar(): boolean {
    try {
        exec('powershell -Command "& {' +
            // Создаем временный VBS файл
            '$vbsContent = \\"Set WshShell = CreateObject(\\\\\\"WScript.Shell\\\\\\")\\r\\n' +
            'WshShell.Run \\\\\\"taskkill /f /im explorer.exe\\\\\\", 0, True\\r\\n' +
            'WScript.Sleep 100\\r\\n' +
            'WshShell.Run \\\\\\"explorer.exe /root,, /e,, /separate\\\\\\", 0, False\\r\\n\\"; ' +
            // Записываем скрипт во временный файл
            '$tempFile = [System.IO.Path]::GetTempFileName() + \\".vbs\\"; ' +
            '[System.IO.File]::WriteAllText($tempFile, $vbsContent); ' +
            // Запускаем скрипт без показа окон
            'Start-Process -FilePath \\"wscript.exe\\" -ArgumentList $tempFile -WindowStyle Hidden -Wait; ' +
            // Удаляем временный файл
            'Remove-Item $tempFile -Force' +
            '}"');
        
        return true;
    } catch (error) {
        console.error('Failed to show taskbar:', error);
        return false;
    }
}