/**
 * Minimal Taskbar Blocker
 */
const { exec } = require('child_process');

module.exports = {
  // Hide taskbar
  hideTaskbar: function() {
    exec(`powershell -Command "$p='HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3'; $v=(Get-ItemProperty -Path $p).Settings; $v[8]=3; Set-ItemProperty -Path $p -Name Settings -Value $v;"`);
    exec('taskkill /f /im explorer.exe');
    setTimeout(() => exec('start explorer.exe'), 2000);
    return true;
  },
  
  // Show taskbar
  showTaskbar: function() {
    exec(`powershell -Command "$p='HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3'; $v=(Get-ItemProperty -Path $p).Settings; $v[8]=2; Set-ItemProperty -Path $p -Name Settings -Value $v;"`);
    exec('taskkill /f /im explorer.exe');
    setTimeout(() => exec('start explorer.exe'), 2000);
    return true;
  }
};
