#include <napi.h>
#include <windows.h>

// Global hook handle
HHOOK g_hKeyboardHook = NULL;

// Low-level keyboard hook callback function
LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode >= 0) {
        KBDLLHOOKSTRUCT* pKeyboard = (KBDLLHOOKSTRUCT*)lParam;
        
        // Block Windows keys (VK_LWIN: 0x5B, VK_RWIN: 0x5C)
        if (pKeyboard->vkCode == VK_LWIN || pKeyboard->vkCode == VK_RWIN) {
            return 1; // Block the key
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
