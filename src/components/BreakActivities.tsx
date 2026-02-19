import { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  Eye, 
  Wind, 
  Footprints, 
  Coffee,
  Timer,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BreakActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  type: 'stretch' | 'eye' | 'breathing' | 'walk' | 'custom';
  icon: React.ElementType;
}

const activities: BreakActivity[] = [
  {
    id: '1',
    title: 'Desk Stretches',
    description: 'Stretch your neck, shoulders, and wrists. Roll your shoulders back 5 times, then forward 5 times. Gently tilt your head side to side.',
    duration: 120,
    type: 'stretch',
    icon: Dumbbell,
  },
  {
    id: '2',
    title: 'Eye Exercise',
    description: 'Follow the 20-20-20 rule: Look at something 20 feet away for 20 seconds. Blink slowly 10 times to refresh your eyes.',
    duration: 60,
    type: 'eye',
    icon: Eye,
  },
  {
    id: '3',
    title: 'Deep Breathing',
    description: 'Breathe in for 4 counts, hold for 4, exhale for 4. Repeat 5 times. Focus on your breath and clear your mind.',
    duration: 90,
    type: 'breathing',
    icon: Wind,
  },
  {
    id: '4',
    title: 'Short Walk',
    description: 'Take a quick walk around your room or office. Get your blood flowing and clear your mind.',
    duration: 180,
    type: 'walk',
    icon: Footprints,
  },
  {
    id: '5',
    title: 'Hydration Break',
    description: 'Drink a glass of water. Staying hydrated helps maintain focus and energy levels.',
    duration: 60,
    type: 'custom',
    icon: Coffee,
  },
];

interface BreakActivitiesProps {
  className?: string;
}

export function BreakActivities({ className }: BreakActivitiesProps) {
  const [selectedActivity, setSelectedActivity] = useState<BreakActivity | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
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
  }, [isRunning, timeRemaining]);

  const startActivity = (activity: BreakActivity) => {
    setSelectedActivity(activity);
    setTimeRemaining(activity.duration);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (selectedActivity) {
      setTimeRemaining(selectedActivity.duration);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedActivity 
    ? ((selectedActivity.duration - timeRemaining) / selectedActivity.duration) * 100 
    : 0;

  if (selectedActivity) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <selectedActivity.icon className="w-5 h-5 text-[#4062ff]" />
              {selectedActivity.title}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(null)}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{selectedActivity.description}</p>
          
          {/* Timer */}
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold font-['Space_Grotesk'] mb-4">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="icon" onClick={resetTimer}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button onClick={toggleTimer} className="gap-2">
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full max-w-md mx-auto space-y-3', className)}>
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Suggested Break Activities
      </h4>
      {activities.map((activity) => (
        <motion.div
          key={activity.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="cursor-pointer hover:border-[#4062ff]/30 transition-colors"
            onClick={() => startActivity(activity)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-[#4062ff]/10 rounded-lg">
                <activity.icon className="w-5 h-5 text-[#4062ff]" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{activity.title}</h5>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activity.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                {Math.floor(activity.duration / 60)}m
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
