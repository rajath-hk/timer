import { useMemo, useCallback } from 'react';
import type { FocusSession, Task, DailyStats, Achievement } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay, subDays, startOfDay } from 'date-fns';

const defaultAchievements: Achievement[] = [
  { id: '1', name: 'First Steps', description: 'Complete your first focus session', icon: '🎯', requirement: 1, type: 'sessions' },
  { id: '2', name: 'Getting Started', description: 'Complete 5 focus sessions', icon: '🚀', requirement: 5, type: 'sessions' },
  { id: '3', name: 'Focus Master', description: 'Complete 25 focus sessions', icon: '⭐', requirement: 25, type: 'sessions' },
  { id: '4', name: 'Pomodoro Pro', description: 'Complete 100 focus sessions', icon: '👑', requirement: 100, type: 'sessions' },
  { id: '5', name: 'Time Keeper', description: 'Focus for 1 hour total', icon: '⏰', requirement: 60, type: 'hours' },
  { id: '6', name: 'Dedicated Learner', description: 'Focus for 10 hours total', icon: '📚', requirement: 600, type: 'hours' },
  { id: '7', name: 'Deep Worker', description: 'Focus for 50 hours total', icon: '🔥', requirement: 3000, type: 'hours' },
  { id: '8', name: 'Consistency', description: 'Maintain a 3-day streak', icon: '📅', requirement: 3, type: 'streak' },
  { id: '9', name: 'Habit Builder', description: 'Maintain a 7-day streak', icon: '💪', requirement: 7, type: 'streak' },
  { id: '10', name: 'Task Master', description: 'Complete 10 tasks', icon: '✅', requirement: 10, type: 'tasks' },
  { id: '11', name: 'Productivity Ninja', description: 'Complete 50 tasks', icon: '🥷', requirement: 50, type: 'tasks' },
];

export function useStatistics(sessions: FocusSession[], tasks: Task[]) {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', defaultAchievements);

  // Get today's date
  const today = useMemo(() => new Date(), []);

  // Calculate total focus time (in minutes)
  const totalFocusTime = useMemo(() => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  }, [sessions]);

  // Calculate total sessions
  const totalSessions = useMemo(() => sessions.length, [sessions]);

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todaySessions = sessions.filter(session => 
      isSameDay(parseISO(session.startTime), today)
    );
    const todayTasks = tasks.filter(task => 
      task.completedAt && isSameDay(parseISO(task.completedAt), today)
    );

    return {
      focusTime: todaySessions.reduce((total, session) => total + session.duration, 0),
      sessions: todaySessions.length,
      tasksCompleted: todayTasks.length,
    };
  }, [sessions, tasks, today]);

  // Calculate this week's stats
  const weekStats = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyBreakdown: DailyStats[] = days.map(day => {
      const daySessions = sessions.filter(session => 
        isSameDay(parseISO(session.startTime), day)
      );
      const dayTasks = tasks.filter(task => 
        task.completedAt && isSameDay(parseISO(task.completedAt), day)
      );

      return {
        date: format(day, 'yyyy-MM-dd'),
        totalFocusTime: daySessions.reduce((total, session) => total + session.duration, 0),
        sessionsCompleted: daySessions.length,
        tasksCompleted: dayTasks.length,
      };
    });

    return {
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      totalFocusTime: dailyBreakdown.reduce((total, day) => total + day.totalFocusTime, 0),
      sessionsCompleted: dailyBreakdown.reduce((total, day) => total + day.sessionsCompleted, 0),
      tasksCompleted: dailyBreakdown.reduce((total, day) => total + day.tasksCompleted, 0),
      dailyBreakdown,
    };
  }, [sessions, tasks, today]);

  // Calculate streak
  const streak = useMemo(() => {
    let currentStreak = 0;
    const checkDate = startOfDay(today);

    // Check if today has activity
    const hasTodayActivity = sessions.some(session => 
      isSameDay(parseISO(session.startTime), checkDate)
    ) || tasks.some(task => 
      task.completedAt && isSameDay(parseISO(task.completedAt), checkDate)
    );

    // If no activity today, start checking from yesterday
    if (!hasTodayActivity) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days with activity
    while (true) {
      const hasActivity = sessions.some(session => 
        isSameDay(parseISO(session.startTime), checkDate)
      ) || tasks.some(task => 
        task.completedAt && isSameDay(parseISO(task.completedAt), checkDate)
      );

      if (hasActivity) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }, [sessions, tasks, today]);

  // Calculate longest streak
  const longestStreak = useMemo(() => {
    const allDates = new Set<string>();
    
    sessions.forEach(session => {
      allDates.add(format(parseISO(session.startTime), 'yyyy-MM-dd'));
    });
    
    tasks.forEach(task => {
      if (task.completedAt) {
        allDates.add(format(parseISO(task.completedAt), 'yyyy-MM-dd'));
      }
    });

    const sortedDates = Array.from(allDates).sort();
    let maxStreak = 0;
    let currentStreakCount = 0;
    let previousDate: Date | null = null;

    sortedDates.forEach(dateStr => {
      const date = parseISO(dateStr);
      
      if (previousDate) {
        const diffDays = Math.floor((date.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreakCount++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      } else {
        currentStreakCount = 1;
      }
      
      previousDate = date;
    });

    return Math.max(maxStreak, currentStreakCount);
  }, [sessions, tasks]);

  // Get stats for last 7 days
  const last7Days = useMemo(() => {
    const days: DailyStats[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const daySessions = sessions.filter(session => 
        isSameDay(parseISO(session.startTime), date)
      );
      const dayTasks = tasks.filter(task => 
        task.completedAt && isSameDay(parseISO(task.completedAt), date)
      );

      days.push({
        date: format(date, 'yyyy-MM-dd'),
        totalFocusTime: daySessions.reduce((total, session) => total + session.duration, 0),
        sessionsCompleted: daySessions.length,
        tasksCompleted: dayTasks.length,
      });
    }

    return days;
  }, [sessions, tasks, today]);

  // Get task completion stats
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending: total - completed,
      completionRate: Math.round(completionRate),
    };
  }, [tasks]);

  // Get time by task
  const timeByTask = useMemo(() => {
    const taskTimeMap = new Map<string, { title: string; time: number; sessions: number }>();

    sessions.forEach(session => {
      if (session.taskId && session.taskTitle) {
        const existing = taskTimeMap.get(session.taskId);
        if (existing) {
          existing.time += session.duration;
          existing.sessions += 1;
        } else {
          taskTimeMap.set(session.taskId, {
            title: session.taskTitle,
            time: session.duration,
            sessions: 1,
          });
        }
      }
    });

    return Array.from(taskTimeMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);
  }, [sessions]);

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    const updatedAchievements = [...achievements];
    const newlyUnlocked: Achievement[] = [];

    updatedAchievements.forEach((achievement, index) => {
      if (achievement.unlockedAt) return;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'sessions':
          shouldUnlock = totalSessions >= achievement.requirement;
          break;
        case 'hours':
          shouldUnlock = totalFocusTime >= achievement.requirement;
          break;
        case 'streak':
          shouldUnlock = streak >= achievement.requirement;
          break;
        case 'tasks':
          shouldUnlock = taskStats.completed >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        updatedAchievements[index] = { ...achievement, unlockedAt: new Date().toISOString() };
        newlyUnlocked.push(updatedAchievements[index]);
      }
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
    }

    return newlyUnlocked;
  }, [achievements, totalSessions, totalFocusTime, streak, taskStats.completed, setAchievements]);

  // Get unlocked achievements
  const unlockedAchievements = useMemo(() => {
    return achievements.filter(a => a.unlockedAt);
  }, [achievements]);

  // Get locked achievements
  const lockedAchievements = useMemo(() => {
    return achievements.filter(a => !a.unlockedAt);
  }, [achievements]);

  // Export data
  const exportData = useCallback(() => {
    const data = {
      sessions,
      tasks,
      achievements,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sessions, tasks, achievements]);

  // Import data
  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      return {
        sessions: data.sessions || [],
        tasks: data.tasks || [],
        achievements: data.achievements || [],
      };
    } catch (error) {
      console.error('Error importing data:', error);
      return null;
    }
  }, []);

  return {
    // Stats
    totalFocusTime,
    totalSessions,
    todayStats,
    weekStats,
    streak,
    longestStreak,
    last7Days,
    taskStats,
    timeByTask,
    
    // Achievements
    achievements,
    unlockedAchievements,
    lockedAchievements,
    checkAchievements,
    
    // Data management
    exportData,
    importData,
  };
}
