import { useState, useCallback } from 'react';
import { AlertTriangle, X, MessageSquare, Zap, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Distraction } from '@/types';

interface DistractionLoggerProps {
  onLogDistraction: (distraction: Omit<Distraction, 'id' | 'timestamp'>) => void;
  distractions: Distraction[];
}

const distractionTypes = [
  { id: 'internal' as const, label: 'Internal', icon: '💭', description: 'Daydreaming, zoning out' },
  { id: 'external' as const, label: 'External', icon: '📱', description: 'Phone, noise, people' },
  { id: 'other' as const, label: 'Other', icon: '🔄', description: 'Other interruptions' },
];

export function DistractionLogger({ onLogDistraction, distractions }: DistractionLoggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<Distraction['type']>('internal');
  const [note, setNote] = useState('');

  const handleLog = useCallback(() => {
    onLogDistraction({
      type: selectedType,
      note: note || 'No details',
    });
    setNote('');
    setSelectedType('internal');
    setIsExpanded(false);
  }, [selectedType, note, onLogDistraction]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="gap-2 text-muted-foreground border-dashed border-border/60 w-full"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Log a Distraction
              {distractions.length > 0 && (
                <span className="ml-1 text-xs bg-secondary px-1.5 py-0.5 rounded-full">
                  {distractions.length}
                </span>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 rounded-xl border border-border/70 bg-card/80 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                What distracted you?
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex gap-1.5 mb-3">
              {distractionTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all border',
                    selectedType === t.id
                      ? 'border-[#4062ff] bg-[#4062ff]/10 text-foreground'
                      : 'border-border/50 text-muted-foreground hover:border-[#4062ff]/30'
                  )}
                  title={t.description}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Quick note (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLog();
                  if (e.key === 'Escape') setIsExpanded(false);
                }}
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" className="h-8 px-3 gap-1" onClick={handleLog}>
                <Plus className="w-3.5 h-3.5" />
                Log
              </Button>
            </div>

            {distractions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                {distractions.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {d.type === 'internal' ? '💭' : d.type === 'external' ? '📱' : '🔄'}
                    </span>
                    <span className="truncate flex-1">{d.note}</span>
                  </div>
                ))}
                {distractions.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{distractions.length - 3} more logged this session
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
