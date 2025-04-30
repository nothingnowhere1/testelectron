#include <napi.h>
#include <windows.h>

// Global hook handle
HHOOK g_hKeyboardHook = NULL;

// Track Alt key state
bool g_altKeyDown = false;

// Low-level keyboard hook callback function
LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode >= 0) {
        KBDLLHOOKSTRUCT* pKeyboard = (KBDLLHOOKSTRUCT*)lParam;
        
        // Block Windows keys (VK_LWIN: 0x5B, VK_RWIN: 0x5C)
        if (pKeyboard->vkCode == VK_LWIN || pKeyboard->vkCode == VK_RWIN) {
            return 1; // Block the key
        }
        
        // Handle Alt key for Alt+Tab blocking
        if (pKeyboard->vkCode == VK_MENU || pKeyboard->vkCode == VK_LMENU || pKeyboard->vkCode == VK_RMENU) {
            if (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN) {
                g_altKeyDown = true;
            } else if (wParam == WM_KEYUP || wParam == WM_SYSKEYUP) {
                g_altKeyDown = false;
            }
        }
        
        // Block Tab key when Alt is pressed (Alt+Tab)
        if (g_altKeyDown && pKeyboard->vkCode == VK_TAB) {
            return 1; // Block the key combination
        }
        
        // Also block Alt+Esc combination
        if (g_altKeyDown && pKeyboard->vkCode == VK_ESCAPE) {
            return 1; // Block the key combination
        }
    }
    
    return CallNextHookEx(g_hKeyboardHook, nCode, wParam, lParam);
}

// Start the keyboard hook
Napi::Boolean StartKeyboardHook(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // Install the low-level keyboard hook
    g_hKeyboardHook = SetWindowsHookEx(
        WH_KEYBOARD_LL,           // Low-level keyboard hook
        LowLevelKeyboardProc,     // Hook procedure
        GetModuleHandle(NULL),    // Instance handle
        0                         // Thread ID (0 = all threads)
    );
    
    if (g_hKeyboardHook == NULL) {
        return Napi::Boolean::New(env, false);
    }
    
    return Napi::Boolean::New(env, true);
}

// Stop the keyboard hook
Napi::Boolean StopKeyboardHook(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (g_hKeyboardHook != NULL) {
        UnhookWindowsHookEx(g_hKeyboardHook);
        g_hKeyboardHook = NULL;
        g_altKeyDown = false;
        return Napi::Boolean::New(env, true);
    }
    
    return Napi::Boolean::New(env, false);
}

// Initialize the addon
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "startKeyboardHook"),
        Napi::Function::New(env, StartKeyboardHook)
    );
    
    exports.Set(
        Napi::String::New(env, "stopKeyboardHook"),
        Napi::Function::New(env, StopKeyboardHook)
    );
    
    return exports;
}

NODE_API_MODULE(win_key_blocker, Init)
