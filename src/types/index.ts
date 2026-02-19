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
