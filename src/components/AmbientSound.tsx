import { Volume2, VolumeX, Headphones, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ambientSounds } from '@/hooks/useAmbientSound';

interface AmbientSoundProps {
  activeSoundId: string;
  isPlaying: boolean;
  volume: number;
  onToggleSound: (soundId: string) => void;
  onVolumeChange: (volume: number) => void;
}

export function AmbientSound({
  activeSoundId,
  isPlaying,
  volume,
  onToggleSound,
  onVolumeChange,
}: AmbientSoundProps) {
  const activeSound = ambientSounds.find(s => s.id === activeSoundId);
  const showVolume = isPlaying && activeSoundId !== 'none';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Music className="w-3.5 h-3.5" />
          Focus Sounds
        </h4>
        {showVolume && (
          <span className="text-xs text-muted-foreground">
            {Math.round(volume * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {ambientSounds.slice(1).map((sound) => {
          const isActive = activeSoundId === sound.id;
          return (
            <motion.button
              key={sound.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleSound(sound.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border',
                isActive && isPlaying
                  ? 'border-transparent text-white shadow-md'
                  : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-[#4062ff]/30 bg-card/50'
              )}
              style={isActive && isPlaying ? {
                backgroundColor: sound.color,
                boxShadow: `0 4px 12px ${sound.color}40`,
              } : undefined}
            >
              <span className="text-sm">{sound.icon}</span>
              <span>{sound.name}</span>
              {isActive && isPlaying && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1"
                >
                  <Headphones className="w-3 h-3" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showVolume && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-3"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onVolumeChange(volume === 0 ? 0.3 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => onVolumeChange(v / 100)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
