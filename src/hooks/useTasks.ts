import { useCallback, useMemo } from 'react';
import type { Task, TaskPriority, RecurringType, Subtask } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { format, addDays, addWeeks, addMonths, isPast, parseISO } from 'date-fns';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);

  // Add new task
  const addTask = useCallback((taskData: { title: string; description?: string; priority?: TaskPriority; dueDate?: string }) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalFocusTime: 0,
      sessionsCompleted: 0,
      completed: false,
      pinned: false,
      subtasks: [],
      tags: [],
      recurring: 'none',
      priority: taskData.priority || 'medium',
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
  }, [setTasks]);

  // Update task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, [setTasks]);

  // Delete task
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  // Toggle task completion
  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      }
      return task;
    }));
  }, [setTasks]);

  // Toggle pin
  const togglePin = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, pinned: !task.pinned } : task
    ));
  }, [setTasks]);

  // Add subtask
  const addSubtask = useCallback((taskId: string, title: string) => {
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title,
      completed: false,
    };
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subtasks: [...task.subtasks, newSubtask] }
        : task
    ));
  }, [setTasks]);

  // Toggle subtask
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map(st => 
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          }
        : task
    ));
  }, [setTasks]);

  // Delete subtask
  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) }
        : task
    ));
  }, [setTasks]);

  // Add tag
  const addTag = useCallback((taskId: string, tag: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId && !task.tags.includes(tag)
        ? { ...task, tags: [...task.tags, tag] }
        : task
    ));
  }, [setTasks]);

  // Remove tag
  const removeTag = useCallback((taskId: string, tag: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, tags: task.tags.filter(t => t !== tag) }
        : task
    ));
  }, [setTasks]);

  // Set recurring
  const setRecurring = useCallback((taskId: string, recurring: RecurringType) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, recurring } : task
    ));
  }, [setTasks]);

  // Increment task focus time
  const incrementFocusTime = useCallback((taskId: string, minutes: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            totalFocusTime: task.totalFocusTime + minutes,
            sessionsCompleted: task.sessionsCompleted + 1,
          }
        : task
    ));
  }, [setTasks]);

  // Get pinned tasks
  const pinnedTasks = useMemo(() => {
    return tasks.filter(task => task.pinned && !task.completed);
  }, [tasks]);

  // Get active (incomplete) tasks sorted by priority and pin
  const activeTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks]);

  // Get completed tasks
  const completedTasks = useMemo(() => {
    return tasks.filter(task => task.completed);
  }, [tasks]);

  // Get tasks by tag
  const getTasksByTag = useCallback((tag: string) => {
    return tasks.filter(task => task.tags.includes(tag));
  }, [tasks]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      isPast(parseISO(task.dueDate))
    );
  }, [tasks]);

  // Get tasks due today
  const tasksDueToday = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate === today
    );
  }, [tasks]);

  // Handle recurring tasks - create next occurrence
  const processRecurringTasks = useCallback(() => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.completed && task.recurring !== 'none') {
        let nextDate: Date | null = null;
        const dueDate = task.dueDate ? parseISO(task.dueDate) : now;
        
        switch (task.recurring) {
          case 'daily':
            nextDate = addDays(dueDate, 1);
            break;
          case 'weekly':
            nextDate = addWeeks(dueDate, 1);
            break;
          case 'monthly':
            nextDate = addMonths(dueDate, 1);
            break;
        }

        if (nextDate) {
          // Check if next occurrence already exists
          const exists = tasks.some(t => 
            t.title === task.title && 
            t.dueDate === format(nextDate!, 'yyyy-MM-dd') &&
            !t.completed
          );

          if (!exists) {
            addTask({
              title: task.title,
              description: task.description,
              priority: task.priority,
              dueDate: format(nextDate, 'yyyy-MM-dd'),
            });
            // Mark original as processed
            updateTask(task.id, { recurring: 'none' });
          }
        }
      }
    });
  }, [tasks, addTask, updateTask]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tasks]);

  return {
    tasks,
    activeTasks,
    completedTasks,
    pinnedTasks,
    overdueTasks,
    tasksDueToday,
    allTags,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    togglePin,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTag,
    removeTag,
    setRecurring,
    incrementFocusTime,
    getTasksByTag,
    processRecurringTasks,
  };
}
