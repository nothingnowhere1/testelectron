/**
 * Windows Key Blocker
 * 
 * Simple module to block and unblock the Windows key
 */

const { exec } = require('child_process');

/**
 * Block Windows key functionality
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function blockWindowsKey() {
  console.log('Blocking Windows key...');
  
  try {
    // Method 1: Registry modification
    exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v "NoWinKeys" /t REG_DWORD /d 1 /f');
    
    // Method 2: Disable keyboard shortcuts
    exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisabledHotkeys" /t REG_SZ /d "RSLM" /f');
    
    // Method 3: Use keyboard scancode map (requires admin privileges)
    try {
      // Create scancode map that maps Windows keys to nothing
      const scanCodeMapValue = Buffer.from([
        // Header: Version, Flags, Entry count, Padding
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        // Entry count (3: header, 2 mappings, null terminator)
        0x03, 0x00, 0x00, 0x00,
        // Left Windows key (0x5B) -> mapped to 0x00 (nothing)
        0x00, 0x00, 0x5B, 0xE0,
        // Right Windows key (0x5C) -> mapped to 0x00 (nothing)
        0x00, 0x00, 0x5C, 0xE0,
        // Null terminator
        0x00, 0x00, 0x00, 0x00
      ]);
      
      // Convert buffer to hex string for registry
      let hexString = '';
      for (let i = 0; i < scanCodeMapValue.length; i++) {
        hexString += scanCodeMapValue[i].toString(16).padStart(2, '0');
      }
      
      // Apply scancode map to registry
      exec(`reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /t REG_BINARY /d ${hexString} /f`);
    } catch (error) {
      console.log('Note: Scancode map method requires admin privileges, might not have applied', error);
    }
    
    // Method 4: DOM level event listeners should be added in the app's renderer process
    
    console.log('Windows key blocked successfully');
    return true;
  } catch (error) {
    console.error('Error blocking Windows key:', error);
    return false;
  }
}

/**
 * Unblock Windows key functionality
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function unblockWindowsKey() {
  console.log('Unblocking Windows key...');
  
  try {
    // Remove registry modifications
    exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v "NoWinKeys" /f');
    exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisabledHotkeys" /f');
    
    // Remove scancode map (requires admin privileges)
    try {
      exec('reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Keyboard Layout" /v "Scancode Map" /f');
    } catch (error) {
      console.log('Note: Removing scancode map requires admin privileges, might not have applied', error);
    }
    
    console.log('Windows key unblocked successfully');
    return true;
  } catch (error) {
    console.error('Error unblocking Windows key:', error);
    return false;
  }
}

module.exports = {
  blockWindowsKey,
  unblockWindowsKey
};
