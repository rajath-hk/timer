import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
      const altMatch = !!shortcut.alt === event.altKey;
      const shiftMatch = !!shortcut.shift === event.shiftKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for the timer
export function useTimerShortcuts(
  startTimer: () => void,
  pauseTimer: () => void,
  stopTimer: () => void,
  skipTimer: () => void,
  resetTimer: () => void,
  isRunning: boolean
) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: ' ',
      handler: () => {
        if (isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      },
      preventDefault: true,
    },
    {
      key: 'r',
      handler: resetTimer,
    },
    {
      key: 's',
      handler: stopTimer,
    },
    {
      key: 'ArrowRight',
      handler: skipTimer,
    },
    {
      key: 'Escape',
      handler: stopTimer,
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

// Global app shortcuts
export function useAppShortcuts(
  toggleTheme: () => void,
  toggleFocusMode: () => void,
  openSettings: () => void
) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 't',
      ctrl: true,
      handler: toggleTheme,
    },
    {
      key: 'f',
      ctrl: true,
      handler: toggleFocusMode,
    },
    {
      key: ',',
      ctrl: true,
      handler: openSettings,
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
