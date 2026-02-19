import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import type { FocusSession, Task } from '@/types';

interface CalendarProps {
  sessions: FocusSession[];
  tasks: Task[];
}

interface CalendarDay {
  date: Date;
  sessions: FocusSession[];
  tasks: Task[];
  focusTime: number;
}

export function Calendar({ sessions, tasks }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
    const days: CalendarDay[] = [];

    let day = start;
    while (day <= end) {
      const daySessions = sessions.filter(session => 
        isSameDay(parseISO(session.startTime), day)
      );
      const dayTasks = tasks.filter(task => 
        task.completedAt && isSameDay(parseISO(task.completedAt), day)
      );
      const focusTime = daySessions.reduce((total, session) => total + session.duration, 0);

      days.push({
        date: new Date(day),
        sessions: daySessions,
        tasks: dayTasks,
        focusTime,
      });

      day = addDays(day, 1);
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedDayData = selectedDate 
    ? days.find(d => isSameDay(d.date, selectedDate))
    : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isToday = isSameDay(day.date, new Date());
              const isCurrentMonth = isSameMonth(day.date, currentMonth);
              const hasActivity = day.sessions.length > 0 || day.tasks.length > 0;
              const intensity = Math.min(day.focusTime / 120, 1); // Max at 2 hours

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    'aspect-square p-2 rounded-lg text-sm transition-all relative',
                    !isCurrentMonth && 'text-muted-foreground opacity-50',
                    isToday && 'ring-2 ring-[#4062ff]',
                    selectedDate && isSameDay(day.date, selectedDate) && 'bg-[#4062ff] text-white',
                    !selectedDate && hasActivity && 'bg-[#4062ff]/10',
                    'hover:bg-secondary'
                  )}
                >
                  <span className="relative z-10">{format(day.date, 'd')}</span>
                  {hasActivity && !selectedDate && (
                    <div 
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#4062ff]"
                      style={{ opacity: 0.3 + intensity * 0.7 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day details */}
      {selectedDayData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {format(selectedDayData.date, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#4062ff]" />
                <span className="text-sm">
                  {selectedDayData.sessions.length} sessions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4062ff]" />
                <span className="text-sm">
                  {Math.floor(selectedDayData.focusTime / 60)}h {selectedDayData.focusTime % 60}m focus time
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4062ff]" />
                <span className="text-sm">
                  {selectedDayData.tasks.length} tasks completed
                </span>
              </div>
            </div>

            {/* Sessions list */}
            {selectedDayData.sessions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Sessions</h4>
                <div className="space-y-2">
                  {selectedDayData.sessions.map(session => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {session.taskTitle || 'Focus Session'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(session.startTime), 'h:mm a')} - 
                          {format(parseISO(session.endTime), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {session.duration} min
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks list */}
            {selectedDayData.tasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Completed Tasks</h4>
                <div className="space-y-2">
                  {selectedDayData.tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayData.sessions.length === 0 && selectedDayData.tasks.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No activity on this day
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
