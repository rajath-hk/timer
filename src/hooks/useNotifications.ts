import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const soundUrls: Record<string, string> = {
  bell: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  chime: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3',
  digital: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
  gentle: 'https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3',
  notification: 'https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

const syntheticSoundPatterns: Record<string, number[]> = {
  beep: [880],
  doubleBeep: [784, 988],
  rising: [523, 659, 784],
};

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage('notificationSettings', {
    soundEnabled: true,
    soundVolume: 0.5,
    notificationEnabled: true,
    selectedSound: 'bell',
    vibrationEnabled: true,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const permissionRef = useRef<NotificationPermission>('default');
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = settings.soundVolume;
  }, [settings.soundVolume]);

  // Update volume when settings change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.soundVolume;
    }
  }, [settings.soundVolume]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Play synthesized fallback sound using Web Audio API
  const playSynthPattern = useCallback((pattern: number[]) => {
    if (!settings.soundEnabled) return;

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const stepDuration = 0.18;

    pattern.forEach((frequency, index) => {
      const start = now + index * stepDuration;
      const end = start + stepDuration * 0.8;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);

      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(Math.max(0.01, settings.soundVolume * 0.2), start + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, end);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(start);
      oscillator.stop(end);
    });
  }, [settings.soundEnabled, settings.soundVolume]);

  // Play sound
  const playSound = useCallback((soundName?: string) => {
    if (!settings.soundEnabled) return;

    const soundToPlay = soundName || settings.selectedSound;
    const synthPattern = syntheticSoundPatterns[soundToPlay];

    if (synthPattern) {
      playSynthPattern(synthPattern);
      return;
    }

    if (!audioRef.current) {
      playSynthPattern(syntheticSoundPatterns.doubleBeep);
      return;
    }

    const soundUrl = soundUrls[soundToPlay] || soundUrls[settings.selectedSound] || soundUrls.bell;

    audioRef.current.src = soundUrl;
    audioRef.current.currentTime = 0;
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Error playing sound URL, using fallback:', error);
        playSynthPattern(syntheticSoundPatterns.doubleBeep);
      });
    }
  }, [settings.soundEnabled, settings.selectedSound, playSynthPattern]);

  // Send browser notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!settings.notificationEnabled) return;

    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'study-timer',
        requireInteraction: true,
        ...options,
      });
    } else if (Notification.permission === 'default') {
      requestPermission().then(granted => {
        if (granted) {
          new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'study-timer',
            requireInteraction: true,
            ...options,
          });
        }
      });
    }
  }, [settings.notificationEnabled, requestPermission]);

  // Vibrate device
  const vibrate = useCallback((pattern: number | number[] = [200, 100, 200]) => {
    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [settings.vibrationEnabled]);

  // Notify timer complete
  const notifyTimerComplete = useCallback((mode: string, customMessage?: string) => {
    const title = mode === 'focus' ? 'Focus Session Complete!' : 'Break Time Over!';
    const body = customMessage || (mode === 'focus' 
      ? 'Great job! Take a well-deserved break.' 
      : 'Time to get back to work!');

    playSound();
    sendNotification(title, { body });
    vibrate([300, 150, 300, 150, 300]);
  }, [playSound, sendNotification, vibrate]);

  // Notify break started
  const notifyBreakStarted = useCallback((breakType: string) => {
    const title = `${breakType} Break Started`;
    const body = 'Relax and recharge for the next session.';

    playSound('gentle');
    sendNotification(title, { body });
    vibrate([200, 100]);
  }, [playSound, sendNotification, vibrate]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  // Test notification
  const testNotification = useCallback(() => {
    playSound();
    sendNotification('Test Notification', { body: 'Your notifications are working!' });
    vibrate();
  }, [playSound, sendNotification, vibrate]);

  return {
    settings,
    updateSettings,
    playSound,
    sendNotification,
    requestPermission,
    vibrate,
    notifyTimerComplete,
    notifyBreakStarted,
    testNotification,
    soundUrls: [...Object.keys(soundUrls), ...Object.keys(syntheticSoundPatterns)],
  };
}
