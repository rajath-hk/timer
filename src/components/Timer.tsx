import { useEffect } from 'react';
import { Play, Pause, Square, SkipForward, RotateCcw, Coffee, Brain, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TimerMode, TimerStatus } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerProps {
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number;
  currentCycle: number;
  cyclesBeforeLongBreak: number;
  formattedTime: (seconds?: number) => string;
  progress: () => number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkip: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  activeTaskTitle?: string;
}

const modeConfig: Record<TimerMode, { icon: React.ElementType; label: string; color: string; gradient: string }> = {
  focus: {
    icon: Brain,
    label: 'Focus Session',
    color: 'text-[#4062ff]',
    gradient: 'from-[#4062ff] to-[#6b8cff]',
  },
  shortBreak: {
    icon: Coffee,
    label: 'Short Break',
    color: 'text-emerald-500',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  longBreak: {
    icon: Sun,
    label: 'Long Break',
    color: 'text-amber-500',
    gradient: 'from-amber-400 to-amber-600',
  },
};

export function Timer({
  mode,
  status,
  timeRemaining,
  currentCycle,
  cyclesBeforeLongBreak,
  formattedTime,
  progress,
  onStart,
  onPause,
  onStop,
  onSkip,
  onReset,
  onModeChange,
  activeTaskTitle,
}: TimerProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;
  const progressValue = progress();
  const isRunning = status === 'running';

  // Calculate circle progress
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  // Update page title with timer
  useEffect(() => {
    const defaultTitle = 'FocusFlow | Focus Timer, Pomodoro Timer, and Study Planner';
    if (isRunning) {
      document.title = `${formattedTime()} - ${mode === 'focus' ? 'Focus' : 'Break'} Timer | FocusFlow`;
    } else {
      document.title = defaultTitle;
    }
    return () => {
      document.title = defaultTitle;
    };
  }, [isRunning, formattedTime, mode, timeRemaining]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      {/* Mode Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-secondary/70 border border-border/70 rounded-full">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              mode === m
                ? 'bg-background border border-border/80 shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/70'
            )}
          >
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8">
        {/* Outer glow */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full blur-3xl opacity-20',
            mode === 'focus' ? 'bg-[#4062ff]' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-amber-500'
          )}
          animate={{
            scale: isRunning ? [1, 1.1, 1] : 1,
            opacity: isRunning ? [0.2, 0.3, 0.2] : 0.2,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* SVG Circle */}
        <svg className="w-72 h-72 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="144"
            cy="144"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <motion.circle
            cx="144"
            cy="144"
            r="120"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={mode === 'focus' ? '#4062ff' : mode === 'shortBreak' ? '#10b981' : '#f59e0b'} />
              <stop offset="100%" stopColor={mode === 'focus' ? '#6b8cff' : mode === 'shortBreak' ? '#34d399' : '#fbbf24'} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <Icon className={cn('w-6 h-6 mb-2', config.color)} />
              <span className="text-sm text-muted-foreground mb-1">{config.label}</span>
            </motion.div>
          </AnimatePresence>
          
          <motion.div
            className="text-6xl font-bold tracking-tight font-['Space_Grotesk']"
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {formattedTime()}
          </motion.div>
          
          {activeTaskTitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-muted-foreground max-w-[200px] truncate text-center"
            >
              {activeTaskTitle}
            </motion.p>
          )}
        </div>
      </div>

      {/* Cycle indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">Cycle</span>
        <div className="flex gap-1">
          {Array.from({ length: cyclesBeforeLongBreak }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                i < currentCycle
                  ? mode === 'focus'
                    ? 'bg-[#4062ff]'
                    : 'bg-emerald-500'
                  : 'bg-secondary'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {currentCycle}/{cyclesBeforeLongBreak}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="w-12 h-12 rounded-full"
            title="Reset (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={onStop}
            className="w-12 h-12 rounded-full"
            title="Stop (S or Esc)"
          >
            <Square className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <Button
            onClick={isRunning ? onPause : onStart}
            className={cn(
              'w-16 h-16 rounded-full text-white shadow-lg transition-all duration-300',
              mode === 'focus'
                ? 'bg-gradient-to-br from-[#4062ff] to-[#6b8cff] hover:shadow-[#4062ff]/30'
                : mode === 'shortBreak'
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 hover:shadow-emerald-500/30'
                : 'bg-gradient-to-br from-amber-400 to-amber-600 hover:shadow-amber-500/30'
            )}
            title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={onSkip}
            className="w-12 h-12 rounded-full"
            title="Skip (→)"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-3">
        <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Space</kbd> Start/Pause</span>
        <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">R</kbd> Reset</span>
        <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">→</kbd> Skip</span>
      </div>
    </div>
  );
}
