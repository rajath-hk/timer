import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  Settings, 
  Moon, 
  Sun, 
  Menu,
  X,
  Focus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'timer' | 'tasks' | 'stats' | 'calendar' | 'settings';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  actualTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'timer', label: 'Timer', icon: Clock },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({
  activeTab,
  onTabChange,
  actualTheme,
  onToggleTheme,
  focusMode,
  onToggleFocusMode,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (focusMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleFocusMode}
          className="gap-2 shadow-lg"
        >
          <X className="w-4 h-4" />
          Exit Focus Mode
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block',
          isScrolled 
            ? 'py-2' 
            : 'py-4'
        )}
      >
        <div className={cn(
          'mx-auto px-4 transition-all duration-300',
          isScrolled 
            ? 'max-w-2xl bg-background/80 backdrop-blur-xl rounded-full shadow-lg border border-border/70' 
            : 'max-w-6xl'
        )}>
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4062ff] to-[#6b8cff] rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden lg:block">FocusFlow</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      activeTab === item.id
                        ? 'bg-[#4062ff] text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    {activeTab === item.id && <span className="absolute inset-0 animate-shimmer opacity-45" />}
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFocusMode}
                className="rounded-full"
                title="Focus Mode (Ctrl+F)"
              >
                <Focus className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="rounded-full"
                title="Toggle Theme (Ctrl+T)"
              >
                {actualTheme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className={cn(
          'mx-4 mt-4 p-2 rounded-2xl transition-all duration-300',
          isScrolled || mobileMenuOpen
            ? 'bg-background/90 backdrop-blur-xl shadow-lg border'
            : 'bg-transparent'
        )}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4062ff] to-[#6b8cff] rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">FocusFlow</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="rounded-full"
              >
                {actualTheme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all',
                          activeTab === item.id
                            ? 'bg-[#4062ff] text-white'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      onToggleFocusMode();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <Focus className="w-5 h-5" />
                    Focus Mode
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t">
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                  activeTab === item.id
                    ? 'text-[#4062ff]'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
