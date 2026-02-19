import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode, TimerStatus, TimerSettings, TimerPreset, FocusSession } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

const defaultPresets: TimerPreset[] = [
  { id: '1', name: 'Classic Pomodoro', focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, cyclesBeforeLongBreak: 4 },
  { id: '2', name: 'Long Focus', focusDuration: 50, shortBreakDuration: 10, longBreakDuration: 30, cyclesBeforeLongBreak: 3 },
  { id: '3', name: 'Short Burst', focusDuration: 15, shortBreakDuration: 3, longBreakDuration: 10, cyclesBeforeLongBreak: 4 },
  { id: '4', name: 'Deep Work', focusDuration: 90, shortBreakDuration: 15, longBreakDuration: 30, cyclesBeforeLongBreak: 2 },
];

export function useTimer() {
  const [settings, setSettings] = useLocalStorage<TimerSettings>('timerSettings', defaultSettings);
  const [presets, setPresets] = useLocalStorage<TimerPreset[]>('timerPresets', defaultPresets);
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focusSessions', []);
  
  const [mode, setMode] = useState<TimerMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState(settings.focusDuration * 60);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>();
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | undefined>();
  const [completionSignal, setCompletionSignal] = useState(0);
  const [lastCompletedMode, setLastCompletedMode] = useState<TimerMode | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // Get duration for current mode
  const getDurationForMode = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'focus':
        return settings.focusDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.focusDuration * 60;
    }
  }, [settings]);

  // Reset timer to current mode
  const resetTimer = useCallback(() => {
    setStatus('idle');
    setTimeRemaining(getDurationForMode(mode));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode, getDurationForMode]);

  // Switch mode
  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setStatus('idle');
    setTimeRemaining(
      newMode === 'focus' ? settings.focusDuration * 60 :
      newMode === 'shortBreak' ? settings.shortBreakDuration * 60 :
      settings.longBreakDuration * 60
    );
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [settings]);

  // Start timer
  const startTimer = useCallback(() => {
    if (status !== 'running') {
      setStatus('running');
      if (mode === 'focus' && !sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }
    }
  }, [status, mode]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setStatus('paused');
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    setStatus('idle');
    setTimeRemaining(getDurationForMode(mode));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sessionStartRef.current = null;
  }, [mode, getDurationForMode]);

  // Skip to next
  const skipTimer = useCallback(() => {
    // Complete current timer
    setTimeRemaining(0);
    handleTimerComplete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentCycle, settings, totalSessions, activeTaskId, activeTaskTitle]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    const completedMode = mode;
    setLastCompletedMode(completedMode);
    setCompletionSignal(prev => prev + 1);

    // Save session if it was a focus session
    if (completedMode === 'focus' && sessionStartRef.current) {
      const session: FocusSession = {
        id: Date.now().toString(),
        taskId: activeTaskId,
        taskTitle: activeTaskTitle,
        startTime: sessionStartRef.current.toISOString(),
        endTime: new Date().toISOString(),
        duration: getDurationForMode('focus') / 60,
        mode: 'focus',
        completed: true,
      };
      setSessions(prev => [session, ...prev]);
      setTotalSessions(prev => prev + 1);
      sessionStartRef.current = null;
    }

    // Determine next mode
    if (completedMode === 'focus') {
      const nextCycle = currentCycle + 1;
      if (nextCycle > settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
        setCurrentCycle(1);
        if (settings.autoStartBreaks) {
          setStatus('running');
        } else {
          setStatus('idle');
        }
      } else {
        setMode('shortBreak');
        setTimeRemaining(settings.shortBreakDuration * 60);
        setCurrentCycle(nextCycle);
        if (settings.autoStartBreaks) {
          setStatus('running');
        } else {
          setStatus('idle');
        }
      }
    } else {
      // Break is over, back to focus
      setMode('focus');
      setTimeRemaining(settings.focusDuration * 60);
      if (settings.autoStartFocus) {
        setStatus('running');
      } else {
        setStatus('idle');
      }
    }
  }, [mode, currentCycle, settings, activeTaskId, activeTaskTitle, setSessions, getDurationForMode]);

  // Timer tick effect
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, handleTimerComplete]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  // Add preset
  const addPreset = useCallback((preset: Omit<TimerPreset, 'id'>) => {
    const newPreset = { ...preset, id: Date.now().toString() };
    setPresets(prev => [...prev, newPreset]);
  }, [setPresets]);

  // Delete preset
  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, [setPresets]);

  // Apply preset
  const applyPreset = useCallback((preset: TimerPreset) => {
    updateSettings({
      focusDuration: preset.focusDuration,
      shortBreakDuration: preset.shortBreakDuration,
      longBreakDuration: preset.longBreakDuration,
      cyclesBeforeLongBreak: preset.cyclesBeforeLongBreak,
    });
    resetTimer();
  }, [updateSettings, resetTimer]);

  // Set active task
  const setActiveTask = useCallback((taskId: string | undefined, taskTitle: string | undefined) => {
    setActiveTaskId(taskId);
    setActiveTaskTitle(taskTitle);
  }, []);

  // Format time as MM:SS
  const formattedTime = useCallback((seconds: number = timeRemaining) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Get progress percentage
  const progress = useCallback(() => {
    const total = getDurationForMode(mode);
    return ((total - timeRemaining) / total) * 100;
  }, [timeRemaining, mode, getDurationForMode]);

  return {
    // State
    mode,
    status,
    timeRemaining,
    currentCycle,
    totalSessions,
    settings,
    presets,
    sessions,
    activeTaskId,
    activeTaskTitle,
    completionSignal,
    lastCompletedMode,
    
    // Actions
    startTimer,
    pauseTimer,
    stopTimer,
    skipTimer,
    resetTimer,
    switchMode,
    updateSettings,
    addPreset,
    deletePreset,
    applyPreset,
    setActiveTask,
    
    // Helpers
    formattedTime,
    progress,
    getDurationForMode,
  };
}
