import { useState, useEffect, useCallback } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
];

interface QuotesProps {
  enabled?: boolean;
  className?: string;
}

export function Quotes({ enabled = true, className }: QuotesProps) {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isVisible, setIsVisible] = useState(true);

  const getRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);

  const refreshQuote = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsVisible(true);
    }, 300);
  }, [getRandomQuote]);

  // Auto-rotate quotes every 5 minutes
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      refreshQuote();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [enabled, refreshQuote]);

  if (!enabled) return null;

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center rounded-2xl border border-border/70 bg-card/70 px-6 py-5 backdrop-blur-sm"
          >
            <Quote className="w-6 h-6 text-[#4062ff]/75 mb-2 animate-breathe" />
            <p className="text-lg font-medium italic mb-2 max-w-lg">
              "{currentQuote.text}"
            </p>
            <p className="text-sm text-muted-foreground">
              — {currentQuote.author}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={refreshQuote}
        className="mt-4 text-muted-foreground opacity-80 hover:opacity-100 hover:text-foreground transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-1" />
        New Quote
      </Button>
    </div>
  );
}

export function BreakQuote() {
  const breakQuotes = [
    { text: "Take a deep breath. You've earned this break.", author: "FocusFlow" },
    { text: "Rest is not idleness. It is the key to productivity.", author: "FocusFlow" },
    { text: "Step away from the screen. Stretch your legs.", author: "FocusFlow" },
    { text: "A refreshed mind is a productive mind.", author: "FocusFlow" },
    { text: "Drink some water. Your brain needs hydration.", author: "FocusFlow" },
    { text: "Look out the window. Give your eyes a rest.", author: "FocusFlow" },
    { text: "Stand up and stretch. Your body will thank you.", author: "FocusFlow" },
    { text: "Take a moment to appreciate your progress.", author: "FocusFlow" },
  ];

  const [quote] = useState(() => breakQuotes[Math.floor(Math.random() * breakQuotes.length)]);

  return (
    <div className="text-center py-8">
      <Quote className="w-8 h-8 text-[#4062ff]/50 mx-auto mb-4" />
      <p className="text-xl font-medium italic mb-2">"{quote.text}"</p>
      <p className="text-sm text-muted-foreground">— {quote.author}</p>
    </div>
  );
}
