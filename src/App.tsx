import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

import { Navigation } from '@/components/Navigation';
import { Timer } from '@/components/Timer';
import { TaskList } from '@/components/TaskList';
import { Statistics } from '@/components/Statistics';
import { Calendar } from '@/components/Calendar';
import { Settings } from '@/components/Settings';
import { Quotes } from '@/components/Quotes';
import { BreakActivities } from '@/components/BreakActivities';
import { AmbientSound } from '@/components/AmbientSound';
import { DistractionLogger } from '@/components/DistractionLogger';
import { SessionNotes } from '@/components/SessionNotes';

import { useTimer } from '@/hooks/useTimer';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { useStatistics } from '@/hooks/useStatistics';
import { useTheme } from '@/hooks/useTheme';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useTimerShortcuts, useAppShortcuts } from '@/hooks/useKeyboardShortcuts';

import { triggerSessionCompleteCelebration, triggerAchievementCelebration } from '@/lib/celebration';
import { cn } from '@/lib/utils';

type Tab = 'timer' | 'tasks' | 'stats' | 'calendar' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [focusMode, setFocusMode] = useState(false);
  const [showSessionNotes, setShowSessionNotes] = useState(false);
  const handledCompletionSignalRef = useRef(0);

  // Hooks
  const timer = useTimer();
  const tasks = useTasks();
  const notifications = useNotifications();
  const stats = useStatistics(timer.sessions, tasks.tasks);
  const theme = useTheme();
  const ambient = useAmbientSound();

  // Keyboard shortcuts
  useTimerShortcuts(
    timer.startTimer,
    timer.pauseTimer,
    timer.stopTimer,
    timer.skipTimer,
    timer.resetTimer,
    timer.status === 'running'
  );

  useAppShortcuts(
    theme.toggleTheme,
    () => setFocusMode(!focusMode),
    () => setActiveTab('settings')
  );

  // Check achievements when stats change
  useEffect(() => {
    const newAchievements = stats.checkAchievements();
    newAchievements.forEach((achievement) => {
      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">{achievement.icon} Achievement Unlocked!</span>
          <span className="text-sm">{achievement.name}</span>
        </div>,
        { duration: 5000 }
      );
      triggerAchievementCelebration();
    });
  }, [timer.totalSessions, stats]);

  // Notify when a timer cycle completes
  useEffect(() => {
    if (timer.completionSignal === 0 || !timer.lastCompletedMode) return;
    if (timer.completionSignal === handledCompletionSignalRef.current) return;
    handledCompletionSignalRef.current = timer.completionSignal;

    notifications.notifyTimerComplete(timer.lastCompletedMode);

    // Trigger celebration
    triggerSessionCompleteCelebration(timer.lastCompletedMode);

    // If focus session completed, show session notes modal
    if (timer.lastCompletedMode === 'focus') {
      setShowSessionNotes(true);
    }

    // If focus session completed, increment task focus time
    if (timer.lastCompletedMode === 'focus' && timer.activeTaskId) {
      tasks.incrementFocusTime(timer.activeTaskId, timer.settings.focusDuration);
    }
  }, [
    timer.completionSignal,
    timer.lastCompletedMode,
    timer.activeTaskId,
    timer.settings.focusDuration,
    notifications.notifyTimerComplete,
    tasks.incrementFocusTime,
  ]);

  // Handle saving session notes
  const handleSaveSessionNotes = useCallback((notes: string) => {
    timer.addSessionNotes(timer.lastSessionId, notes);
    setShowSessionNotes(false);
    if (notes.trim()) {
      toast.success('Session notes saved!', { duration: 3000 });
    }
  }, [timer]);

  // Handle dismissing session notes
  const handleDismissSessionNotes = useCallback(() => {
    setShowSessionNotes(false);
  }, []);

  // Handle data import
  const handleImport = useCallback((jsonString: string) => {
    const data = stats.importData(jsonString);
    if (data) {
      toast.success('Data imported successfully! Please refresh the page.');
    } else {
      toast.error('Failed to import data. Invalid file format.');
    }
  }, [stats]);

  // Clear all data
  const handleClearAllData = useCallback(() => {
    localStorage.clear();
    toast.success('All data cleared. Refreshing...');
    setTimeout(() => window.location.reload(), 1500);
  }, []);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <div className={cn(
            'space-y-8 transition-all duration-500',
            focusMode && 'flex flex-col items-center justify-center min-h-[80vh]'
          )}>
            {/* Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Timer
                mode={timer.mode}
                status={timer.status}
                timeRemaining={timer.timeRemaining}
                currentCycle={timer.currentCycle}
                cyclesBeforeLongBreak={timer.settings.cyclesBeforeLongBreak}
                formattedTime={timer.formattedTime}
                progress={timer.progress}
                onStart={timer.startTimer}
                onPause={timer.pauseTimer}
                onStop={timer.stopTimer}
                onSkip={timer.skipTimer}
                onReset={timer.resetTimer}
                onModeChange={timer.switchMode}
                activeTaskTitle={timer.activeTaskTitle}
              />
            </motion.div>

            {/* Ambient Sound Player (during focus) */}
            {timer.mode === 'focus' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AmbientSound
                  activeSoundId={ambient.activeSoundId}
                  isPlaying={ambient.isPlaying}
                  volume={ambient.volume}
                  onToggleSound={ambient.toggleSound}
                  onVolumeChange={ambient.updateVolume}
                />
              </motion.div>
            )}

            {/* Distraction Logger (during focus) */}
            {timer.mode === 'focus' && (timer.status === 'running' || timer.status === 'paused') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="max-w-md mx-auto"
              >
                <DistractionLogger
                  onLogDistraction={timer.logDistraction}
                  distractions={timer.currentDistractions}
                />
              </motion.div>
            )}

            {/* Break Activities (shown during breaks) */}
            {timer.mode !== 'focus' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <BreakActivities />
              </motion.div>
            )}

            {/* Quotes (shown during focus) */}
            {timer.mode === 'focus' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <Quotes />
              </motion.div>
            )}

            {/* Quick Task Selector (in focus mode) */}
            {!focusMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-md mx-auto"
              >
                <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">
                  Active Task
                </h4>
                {timer.activeTaskId ? (
                  <div className="flex items-center justify-between p-3 bg-[#4062ff]/10 rounded-lg border border-[#4062ff]/30">
                    <span className="font-medium">{timer.activeTaskTitle}</span>
                    <div className="flex items-center gap-2">
                      {timer.currentDistractions.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {timer.currentDistractions.length} distraction{timer.currentDistractions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        onClick={() => timer.setActiveTask(undefined, undefined)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    No active task. Select one from the Tasks tab.
                  </div>
                )}
              </motion.div>
            )}
          </div>
        );

      case 'tasks':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskList
              tasks={tasks.tasks}
              activeTasks={tasks.activeTasks}
              completedTasks={tasks.completedTasks}
              pinnedTasks={tasks.pinnedTasks}
              allTags={tasks.allTags}
              onAddTask={tasks.addTask}
              onUpdateTask={tasks.updateTask}
              onDeleteTask={tasks.deleteTask}
              onToggleComplete={tasks.toggleTaskComplete}
              onTogglePin={tasks.togglePin}
              onAddSubtask={tasks.addSubtask}
              onToggleSubtask={tasks.toggleSubtask}
              onSetActiveTask={timer.setActiveTask}
              activeTaskId={timer.activeTaskId}
            />
          </motion.div>
        );

      case 'stats':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Statistics
              totalFocusTime={stats.totalFocusTime}
              totalSessions={stats.totalSessions}
              todayStats={stats.todayStats}
              weekStats={stats.weekStats}
              streak={stats.streak}
              longestStreak={stats.longestStreak}
              last7Days={stats.last7Days}
              taskStats={stats.taskStats}
              timeByTask={stats.timeByTask}
              achievements={stats.achievements}
              unlockedAchievements={stats.unlockedAchievements}
              onExport={stats.exportData}
              onImport={handleImport}
            />
          </motion.div>
        );

      case 'calendar':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Calendar sessions={timer.sessions} tasks={tasks.tasks} />
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Settings
              timerSettings={timer.settings}
              presets={timer.presets}
              notificationSettings={notifications.settings}
              themeSettings={{
                theme: theme.theme,
                fontSize: theme.fontSize,
                highContrast: theme.highContrast,
                reduceMotion: theme.reduceMotion,
                accentColor: theme.accentColor,
              }}
              soundUrls={notifications.soundUrls}
              onUpdateTimerSettings={timer.updateSettings}
              onAddPreset={timer.addPreset}
              onDeletePreset={timer.deletePreset}
              onApplyPreset={timer.applyPreset}
              onUpdateNotificationSettings={notifications.updateSettings}
              onUpdateThemeSettings={theme.updateSettings}
              onTestNotification={notifications.testNotification}
              onClearAllData={handleClearAllData}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-500 relative overflow-x-hidden',
      theme.actualTheme === 'dark' ? 'dark' : ''
    )}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-28 w-72 h-72 rounded-full bg-[#4062ff]/20 blur-3xl animate-drift"
          animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 -right-24 w-72 h-72 rounded-full bg-emerald-400/15 blur-3xl animate-float-slow"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl"
          animate={{ x: [-10, 10, -10], y: [0, -8, 0], opacity: [0.2, 0.32, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="min-h-screen bg-background/90 text-foreground backdrop-blur-[2px]">
        <Toaster 
          position="top-center" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          actualTheme={theme.actualTheme}
          onToggleTheme={theme.toggleTheme}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode(!focusMode)}
        />

        <main className={cn(
          'pt-20 pb-24 md:pb-8 px-4 md:px-8',
          focusMode && 'pt-8'
        )}>
          <div className="max-w-6xl mx-auto">
            {!focusMode && (
              <header className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Focus Timer and Pomodoro Study App
                </h1>
                <p className="mt-2 text-sm md:text-base text-muted-foreground">
                  Build better focus habits with timed sessions, breaks, tasks, and productivity stats.
                </p>
              </header>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.26 }}
                className={cn(
                  'animate-soft-pop',
                  !focusMode && 'surface-panel rounded-3xl p-4 md:p-6 shadow-[0_20px_40px_-24px_rgba(64,98,255,0.55)]'
                )}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        {!focusMode && (
          <footer className="py-6 text-center text-sm text-muted-foreground hidden md:block animate-fade-in">
            <p>FocusFlow — Master Your Time</p>
            <p className="mt-1 text-xs">
              Press <kbd className="px-1.5 py-0.5 bg-secondary rounded">Space</kbd> to start/pause • 
              <kbd className="px-1.5 py-0.5 bg-secondary rounded ml-1">Ctrl+T</kbd> for theme • 
              <kbd className="px-1.5 py-0.5 bg-secondary rounded ml-1">Ctrl+F</kbd> for focus mode
            </p>
          </footer>
        )}
      </div>

      {/* Session Notes Modal */}
      <SessionNotes
        isOpen={showSessionNotes}
        sessionDuration={timer.settings.focusDuration}
        sessionTask={timer.activeTaskTitle}
        onSave={handleSaveSessionNotes}
        onDismiss={handleDismissSessionNotes}
      />
    </div>
  );
}

export default App;
