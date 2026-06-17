// Timer Types
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface TimerPreset {
  id: string;
  name: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
}

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number; // in seconds
  currentCycle: number;
  totalSessions: number;
}

// Task Types
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  notes?: string;
  subtasks: Subtask[];
  recurring: RecurringType;
  pinned: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  totalFocusTime: number; // in minutes
  sessionsCompleted: number;
}

// Session Types
export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  mode: TimerMode;
  completed: boolean;
  notes?: string;
  distractions?: Distraction[];
}

export interface Distraction {
  id: string;
  sessionId?: string;
  type: 'internal' | 'external' | 'other';
  note: string;
  timestamp: string;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'whiteNoise' | 'rain' | 'forest' | 'waves' | 'lofi';
}

// Statistics Types
export interface DailyStats {
  date: string;
  totalFocusTime: number; // in minutes
  sessionsCompleted: number;
  tasksCompleted: number;
}

export interface WeeklyStats {
  weekStart: string;
  totalFocusTime: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  dailyBreakdown: DailyStats[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
  type: 'sessions' | 'hours' | 'streak' | 'tasks';
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'focus' | 'break' | 'task' | 'reminder';
  taskId?: string;
}

// Settings Types
export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface AccentColor {
  name: string;
  hsl: string; // HSL hue value, e.g. '227' for blue, '0' for red
  color: string; // CSS color string for swatch display
  description: string;
}

export const presetAccentColors: AccentColor[] = [
  { name: 'Blue', hsl: '227', color: '#4062ff', description: 'Default blue' },
  { name: 'Indigo', hsl: '245', color: '#6366f1', description: 'Deep indigo' },
  { name: 'Purple', hsl: '270', color: '#8b5cf6', description: 'Rich purple' },
  { name: 'Pink', hsl: '335', color: '#ec4899', description: 'Warm pink' },
  { name: 'Red', hsl: '0', color: '#ef4444', description: 'Bold red' },
  { name: 'Orange', hsl: '25', color: '#f97316', description: 'Vibrant orange' },
  { name: 'Amber', hsl: '38', color: '#f59e0b', description: 'Warm amber' },
  { name: 'Emerald', hsl: '160', color: '#10b981', description: 'Fresh emerald' },
  { name: 'Teal', hsl: '180', color: '#14b8a6', description: 'Cool teal' },
  { name: 'Cyan', hsl: '200', color: '#06b6d4', description: 'Bright cyan' },
];

export interface AppSettings {
  theme: Theme;
  background: BackgroundType;
  backgroundImage?: string;
  soundEnabled: boolean;
  soundVolume: number;
  notificationEnabled: boolean;
  selectedSound: string;
  showMotivationalQuotes: boolean;
  showBreakPrompts: boolean;
  fontSize: FontSize;
}

// Quote Types
export interface Quote {
  text: string;
  author: string;
}

// Break Activity Types
export interface BreakActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'stretch' | 'eye' | 'breathing' | 'walk' | 'custom';
}
