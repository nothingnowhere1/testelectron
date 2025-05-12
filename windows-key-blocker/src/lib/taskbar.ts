import {exec} from "child_process";

export function showTaskbar(): boolean {
    try {
        // exec(
        //     'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 0 /f',
        // );
		//
        // exec(
        //     'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 1 /f',
        // );

        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 2 /f',
        );

        // exec(
        //     "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;Stop-Process -f -ProcessName explorer;Start-Process explorer}\"",
        // );

        console.log("Taskbar shown");
        return true;
    } catch (error) {
        console.error("Failed to show taskbar:", error);
        return false;
    }
}

export function hideTaskbar(): boolean {
    try {
        // exec(
        //     'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSmallIcons /t REG_DWORD /d 1 /f',
        // );
		//
        exec(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarGlomLevel /t REG_DWORD /d 0 /f',
        );
		//
        // exec(
        //     'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarSizeMove /t REG_DWORD /d 0 /f',
        // );

        // exec(
        //     "powershell -command \"&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=3;&Set-ItemProperty -Path $p -Name Settings -Value $v;Stop-Process -f -ProcessName explorer;Start-Process explorer}\"",
        // );

        console.log("Taskbar hidden");
        return true;
    } catch (error) {
        console.error("Failed to hide taskbar:", error);
        return false;
    }
}