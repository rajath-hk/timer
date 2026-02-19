import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  Flame, 
  TrendingUp,
  Award,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { DailyStats, Achievement } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

interface StatisticsProps {
  totalFocusTime: number;
  totalSessions: number;
  todayStats: { focusTime: number; sessions: number; tasksCompleted: number };
  weekStats: { totalFocusTime: number; sessionsCompleted: number; tasksCompleted: number; dailyBreakdown: DailyStats[] };
  streak: number;
  longestStreak: number;
  last7Days: DailyStats[];
  taskStats: { total: number; completed: number; pending: number; completionRate: number };
  timeByTask: { id: string; title: string; time: number; sessions: number }[];
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  onExport: () => void;
  onImport: (data: string) => void;
}

const COLORS = ['#4062ff', '#8fa6ff', '#ff5858', '#ffb800', '#10b981', '#f59e0b'];

export function Statistics({
  totalFocusTime,
  totalSessions,
  todayStats,
  weekStats,
  streak,
  longestStreak,
  last7Days,
  taskStats,
  timeByTask,
  achievements,
  unlockedAchievements,
  onExport,
  onImport,
}: StatisticsProps) {
  const [, setImportFile] = useState<File | null>(null);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  // Prepare chart data
  const weeklyChartData = last7Days.map(day => ({
    name: format(parseISO(day.date), 'EEE'),
    focusTime: Math.round(day.totalFocusTime / 60 * 10) / 10,
    sessions: day.sessionsCompleted,
  }));

  const taskTimeData = timeByTask.slice(0, 5).map(task => ({
    name: task.title.length > 15 ? task.title.slice(0, 15) + '...' : task.title,
    time: Math.round(task.time / 60 * 10) / 10,
  }));

  const taskCompletionData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'Pending', value: taskStats.pending },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Today's Focus"
          value={formatTime(todayStats.focusTime)}
          subtitle={`${todayStats.sessions} sessions`}
          delay={0}
        />
        <StatCard
          icon={Target}
          label="Total Sessions"
          value={totalSessions.toString()}
          subtitle={`${formatTime(totalFocusTime)} total`}
          delay={0.1}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${streak} days`}
          subtitle={`Best: ${longestStreak} days`}
          delay={0.2}
        />
        <StatCard
          icon={CheckCircle2}
          label="Tasks Done"
          value={taskStats.completed.toString()}
          subtitle={`${taskStats.completionRate}% completion`}
          delay={0.3}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Focus Time (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} hours`, 'Focus Time']}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <Bar 
                      dataKey="focusTime" 
                      fill="#4062ff" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Focus Time</span>
                  <span className="font-semibold">{formatTime(weekStats.totalFocusTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sessions Completed</span>
                  <span className="font-semibold">{weekStats.sessionsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tasks Completed</span>
                  <span className="font-semibold">{weekStats.tasksCompleted}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Average</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg. Focus Time</span>
                  <span className="font-semibold">
                    {formatTime(Math.round(weekStats.totalFocusTime / 7))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg. Sessions</span>
                  <span className="font-semibold">
                    {Math.round((weekStats.sessionsCompleted / 7) * 10) / 10}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Productivity Score</span>
                  <span className="font-semibold text-[#4062ff]">
                    {Math.min(100, Math.round((weekStats.sessionsCompleted / 28) * 100))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskCompletionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskCompletionData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4062ff]" />
                    <span className="text-sm">Completed ({taskStats.completed})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e4e9ff]" />
                    <span className="text-sm">Pending ({taskStats.pending})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time by Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskTimeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [`${value} hours`, 'Time']} />
                      <Bar dataKey="time" fill="#4062ff" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements ({unlockedAchievements.length}/{achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={achievement.unlockedAt ? { scale: 0.8, opacity: 0 } : {}}
                    animate={achievement.unlockedAt ? { scale: 1, opacity: 1 } : {}}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all duration-300',
                      achievement.unlockedAt
                        ? 'border-[#4062ff] bg-[#4062ff]/5'
                        : 'border-dashed border-muted opacity-50'
                    )}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                    {achievement.unlockedAt && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Unlocked {format(parseISO(achievement.unlockedAt), 'MMM d')}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={onExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" className="gap-2" asChild>
              <span>Import Data</span>
            </Button>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, subtitle, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="transition-transform"
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className="p-2 bg-[#4062ff]/10 rounded-lg">
              <Icon className="w-5 h-5 text-[#4062ff]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
