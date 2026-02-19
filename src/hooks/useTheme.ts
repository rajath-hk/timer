import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

export function useTheme() {
  const [settings, setSettings] = useLocalStorage('themeSettings', {
    theme: 'system' as Theme,
    fontSize: 'medium' as FontSize,
    highContrast: false,
    reduceMotion: false,
  });

  // Determine actual theme based on system preference
  const actualTheme = settings.theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    
    // Apply font size
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (settings.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [actualTheme, settings.fontSize, settings.highContrast, settings.reduceMotion]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  // Set theme
  const setTheme = useCallback((theme: Theme) => {
    updateSettings({ theme });
  }, [updateSettings]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  }, [settings.theme, setTheme]);

  // Set font size
  const setFontSize = useCallback((fontSize: FontSize) => {
    updateSettings({ fontSize });
  }, [updateSettings]);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    updateSettings({ highContrast: !settings.highContrast });
  }, [settings.highContrast, updateSettings]);

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    updateSettings({ reduceMotion: !settings.reduceMotion });
  }, [settings.reduceMotion, updateSettings]);

  return {
    theme: settings.theme,
    actualTheme,
    fontSize: settings.fontSize,
    highContrast: settings.highContrast,
    reduceMotion: settings.reduceMotion,
    setTheme,
    toggleTheme,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    updateSettings,
  };
}
