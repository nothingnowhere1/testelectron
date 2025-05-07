/**
 * Native Windows Key Blocker
 *
 * Uses native C++ addon to implement low-level keyboard hooks for
 * blocking the Windows key and other system shortcuts.
 */
/**
 * Start blocking Windows key using native hooks
 * @returns True if successful, false otherwise
 */
export declare function startBlockingWindowsKey(): boolean;
/**
 * Stop blocking Windows key
 * @returns True if successful, false otherwise
 */
export declare function stopBlockingWindowsKey(): boolean;
