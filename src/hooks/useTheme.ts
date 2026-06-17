import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { presetAccentColors } from '@/types';
import type { Theme, FontSize, AccentColor } from '@/types';

export function useTheme() {
  const [settings, setSettings] = useLocalStorage('themeSettings', {
    theme: 'system' as Theme,
    fontSize: 'medium' as FontSize,
    highContrast: false,
    reduceMotion: false,
    accentColor: '227' as string, // default blue hue
  });

  // Look up the current accent color object
  const currentAccent = presetAccentColors.find(c => c.hsl === settings.accentColor) || presetAccentColors[0];

  // Determine actual theme based on system preference
  const actualTheme = settings.theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;

  // Apply theme + accent color to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Trigger theme transition overlay
    root.classList.add('theme-transitioning');
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    
    // Apply accent color as a CSS variable on the root
    const hsl = settings.accentColor;
    root.style.setProperty('--accent-hue', hsl);
    // Also set inline style for direct use (avoids Tailwind JIT limitation)
    root.style.setProperty('--accent-color', currentAccent.color);
    
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

    // Remove transition class after animation completes
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 600);
    
    return () => clearTimeout(timeout);
  }, [actualTheme, settings.fontSize, settings.highContrast, settings.reduceMotion, settings.accentColor]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.add('theme-transitioning');
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      setTimeout(() => root.classList.remove('theme-transitioning'), 600);
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

  // Set accent color
  const setAccentColor = useCallback((hsl: string) => {
    updateSettings({ accentColor: hsl });
  }, [updateSettings]);

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
    accentColor: settings.accentColor,
    currentAccent,
    fontSize: settings.fontSize,
    highContrast: settings.highContrast,
    reduceMotion: settings.reduceMotion,
    setTheme,
    toggleTheme,
    setAccentColor,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    updateSettings,
  };
}
