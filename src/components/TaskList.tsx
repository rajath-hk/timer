import { useState } from 'react';
import { 
  Plus, 
  Pin, 
  Trash2, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  Clock,
  MoreHorizontal,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  pinnedTasks: Task[];
  allTags: string[];
  onAddTask: (task: { title: string; description?: string; priority: TaskPriority; dueDate?: string }) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onSetActiveTask: (taskId: string | undefined, taskTitle: string | undefined) => void;
  activeTaskId?: string;
}

const priorityColors: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function TaskList({
  activeTasks,
  completedTasks,
  pinnedTasks,
  onAddTask,
  onDeleteTask,
  onToggleComplete,
  onTogglePin,
  onAddSubtask,
  onToggleSubtask,
  onSetActiveTask,
  activeTaskId,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  
  // New task form state
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    onAddTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription || undefined,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
    });
    
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setIsAddDialogOpen(false);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Input
                  placeholder="Description (optional)..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Button onClick={handleAddTask} className="w-full" disabled={!newTaskTitle.trim()}>
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick add input */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Quick add task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTaskTitle.trim()) {
              onAddTask({ title: newTaskTitle.trim(), priority: 'medium' });
              setNewTaskTitle('');
            }
          }}
        />
        <Button 
          size="icon" 
          onClick={() => {
            if (newTaskTitle.trim()) {
              onAddTask({ title: newTaskTitle.trim(), priority: 'medium' });
              setNewTaskTitle('');
            }
          }}
          disabled={!newTaskTitle.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Pinned tasks */}
      {pinnedTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Pin className="w-3 h-3" /> Pinned
          </h4>
          <div className="space-y-2">
            {pinnedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isExpanded={expandedTask === task.id}
                isActive={activeTaskId === task.id}
                onToggleExpand={() => toggleExpand(task.id)}
                onToggleComplete={() => onToggleComplete(task.id)}
                onTogglePin={() => onTogglePin(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onSetActive={() => onSetActiveTask(task.id, task.title)}
                onAddSubtask={(title) => onAddSubtask(task.id, title)}
                onToggleSubtask={(subtaskId) => onToggleSubtask(task.id, subtaskId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active tasks */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {activeTasks.filter(t => !t.pinned).map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <TaskItem
                task={task}
                isExpanded={expandedTask === task.id}
                isActive={activeTaskId === task.id}
                onToggleExpand={() => toggleExpand(task.id)}
                onToggleComplete={() => onToggleComplete(task.id)}
                onTogglePin={() => onTogglePin(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onSetActive={() => onSetActiveTask(task.id, task.title)}
                onAddSubtask={(title) => onAddSubtask(task.id, title)}
                onToggleSubtask={(subtaskId) => onToggleSubtask(task.id, subtaskId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Completed tasks toggle */}
      {completedTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Completed ({completedTasks.length})
          </button>
          
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-2"
              >
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isExpanded={false}
                    isActive={false}
                    onToggleExpand={() => {}}
                    onToggleComplete={() => onToggleComplete(task.id)}
                    onTogglePin={() => {}}
                    onDelete={() => onDeleteTask(task.id)}
                    onSetActive={() => {}}
                    onAddSubtask={() => {}}
                    onToggleSubtask={() => {}}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  isExpanded: boolean;
  isActive: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onSetActive: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
}

function TaskItem({
  task,
  isExpanded,
  isActive,
  onToggleExpand,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onSetActive,
  onAddSubtask,
  onToggleSubtask,
}: TaskItemProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;

  return (
    <div
      className={cn(
        'group rounded-lg border p-3 transition-all duration-200',
        task.completed
          ? 'bg-muted/50 opacity-60'
          : isActive
          ? 'border-[#4062ff] bg-[#4062ff]/5'
          : 'bg-card hover:border-[#4062ff]/30'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggleComplete}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium truncate',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            
            {task.pinned && <Pin className="w-3 h-3 text-[#4062ff]" />}
            {task.recurring !== 'none' && <Repeat className="w-3 h-3 text-muted-foreground" />}
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className={cn('text-xs', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            
            {task.dueDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(parseISO(task.dueDate), 'MMM d')}
              </span>
            )}
            
            {task.sessionsCompleted > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.sessionsCompleted} sessions
              </span>
            )}
            
            {task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completedSubtasks}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>
        
        {!task.completed && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', isActive && 'text-[#4062ff]')}
              onClick={onSetActive}
              title={isActive ? 'Active task' : 'Set as active task'}
            >
              <Clock className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', task.pinned && 'text-[#4062ff]')}
              onClick={onTogglePin}
              title={task.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onToggleExpand}>
                  {isExpanded ? 'Collapse' : 'Expand'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Expanded content */}
      {isExpanded && !task.completed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t"
        >
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          )}
          
          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="space-y-1 mb-3">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => onToggleSubtask(subtask.id)}
                    className="w-4 h-4"
                  />
                  <span className={cn('text-sm', subtask.completed && 'line-through text-muted-foreground')}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Add subtask */}
          <div className="flex gap-2">
            <Input
              placeholder="Add subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                  onAddSubtask(newSubtaskTitle.trim());
                  setNewSubtaskTitle('');
                }
              }}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={() => {
                if (newSubtaskTitle.trim()) {
                  onAddSubtask(newSubtaskTitle.trim());
                  setNewSubtaskTitle('');
                }
              }}
              disabled={!newSubtaskTitle.trim()}
              className="h-8 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
