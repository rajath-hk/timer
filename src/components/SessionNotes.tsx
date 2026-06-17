import { useState, useEffect, useCallback } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionNotesProps {
  isOpen: boolean;
  sessionDuration: number;
  sessionTask?: string;
  onSave: (notes: string) => void;
  onDismiss: () => void;
}

const promptSuggestions = [
  'What did you accomplish?',
  'Any challenges you faced?',
  'What to focus on next session?',
  'Rate your focus (1-10):',
];

export function SessionNotes({
  isOpen,
  sessionDuration,
  sessionTask,
  onSave,
  onDismiss,
}: SessionNotesProps) {
  const [notes, setNotes] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setShowPrompts(true);
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    onSave(notes);
  }, [notes, onSave]);

  const handlePromptClick = useCallback((prompt: string) => {
    setNotes(prev => prev ? `${prev}\n${prompt} ` : `${prompt} `);
    setShowPrompts(false);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onDismiss();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#4062ff] to-[#6b8cff] shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Session Complete!
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {sessionDuration} min{sessionTask ? ` — ${sessionTask}` : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {showPrompts && (
                <div className="flex flex-wrap gap-1.5">
                  {promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-xs px-2.5 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-[#4062ff]/40 transition-colors bg-secondary/50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <Textarea
                placeholder="What did you work on? How was your focus? Any thoughts or reflections..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
                autoFocus
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 gap-2 bg-gradient-to-r from-[#4062ff] to-[#6b8cff] text-white"
                >
                  <FileText className="w-4 h-4" />
                  Save Notes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
