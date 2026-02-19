import { useState } from 'react';
import { 
  Settings2, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Moon, 
  Sun, 
  Monitor,
  Type,
  Contrast,
  Zap,
  Save,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TimerSettings, TimerPreset, Theme, FontSize } from '@/types';
import { cn } from '@/lib/utils';

interface SettingsProps {
  timerSettings: TimerSettings;
  presets: TimerPreset[];
  notificationSettings: {
    soundEnabled: boolean;
    soundVolume: number;
    notificationEnabled: boolean;
    selectedSound: string;
    vibrationEnabled: boolean;
  };
  themeSettings: {
    theme: Theme;
    fontSize: FontSize;
    highContrast: boolean;
    reduceMotion: boolean;
  };
  soundUrls: string[];
  onUpdateTimerSettings: (settings: Partial<TimerSettings>) => void;
  onAddPreset: (preset: Omit<TimerPreset, 'id'>) => void;
  onDeletePreset: (id: string) => void;
  onApplyPreset: (preset: TimerPreset) => void;
  onUpdateNotificationSettings: (settings: Partial<{ soundEnabled: boolean; soundVolume: number; notificationEnabled: boolean; selectedSound: string; vibrationEnabled: boolean }>) => void;
  onUpdateThemeSettings: (settings: Partial<{ theme: Theme; fontSize: FontSize; highContrast: boolean; reduceMotion: boolean }>) => void;
  onTestNotification: () => void;
  onClearAllData: () => void;
}

export function Settings({
  timerSettings,
  presets,
  notificationSettings,
  themeSettings,
  soundUrls,
  onUpdateTimerSettings,
  onAddPreset,
  onDeletePreset,
  onApplyPreset,
  onUpdateNotificationSettings,
  onUpdateThemeSettings,
  onTestNotification,
  onClearAllData,
}: SettingsProps) {
  const [newPresetName, setNewPresetName] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const formatSoundLabel = (sound: string) =>
    sound
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase());

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    onAddPreset({
      name: newPresetName.trim(),
      focusDuration: timerSettings.focusDuration,
      shortBreakDuration: timerSettings.shortBreakDuration,
      longBreakDuration: timerSettings.longBreakDuration,
      cyclesBeforeLongBreak: timerSettings.cyclesBeforeLongBreak,
    });
    setNewPresetName('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Timer Settings */}
        <TabsContent value="timer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Timer Durations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Focus Duration */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Focus Duration</Label>
                  <span className="text-sm font-medium">{timerSettings.focusDuration} min</span>
                </div>
                <Slider
                  value={[timerSettings.focusDuration]}
                  onValueChange={([value]) => onUpdateTimerSettings({ focusDuration: value })}
                  min={1}
                  max={120}
                  step={1}
                />
              </div>

              {/* Short Break */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Short Break</Label>
                  <span className="text-sm font-medium">{timerSettings.shortBreakDuration} min</span>
                </div>
                <Slider
                  value={[timerSettings.shortBreakDuration]}
                  onValueChange={([value]) => onUpdateTimerSettings({ shortBreakDuration: value })}
                  min={1}
                  max={30}
                  step={1}
                />
              </div>

              {/* Long Break */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Long Break</Label>
                  <span className="text-sm font-medium">{timerSettings.longBreakDuration} min</span>
                </div>
                <Slider
                  value={[timerSettings.longBreakDuration]}
                  onValueChange={([value]) => onUpdateTimerSettings({ longBreakDuration: value })}
                  min={5}
                  max={60}
                  step={1}
                />
              </div>

              {/* Cycles */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Cycles Before Long Break</Label>
                  <span className="text-sm font-medium">{timerSettings.cyclesBeforeLongBreak}</span>
                </div>
                <Slider
                  value={[timerSettings.cyclesBeforeLongBreak]}
                  onValueChange={([value]) => onUpdateTimerSettings({ cyclesBeforeLongBreak: value })}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              {/* Auto-start options */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Auto-start Breaks</Label>
                  <p className="text-xs text-muted-foreground">Automatically start breaks after focus</p>
                </div>
                <Switch
                  checked={timerSettings.autoStartBreaks}
                  onCheckedChange={(checked) => onUpdateTimerSettings({ autoStartBreaks: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start Focus</Label>
                  <p className="text-xs text-muted-foreground">Automatically start focus after breaks</p>
                </div>
                <Switch
                  checked={timerSettings.autoStartFocus}
                  onCheckedChange={(checked) => onUpdateTimerSettings({ autoStartFocus: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timer Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Preset name..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSavePreset} disabled={!newPresetName.trim()} size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>

              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{preset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {preset.focusDuration}/{preset.shortBreakDuration}/{preset.longBreakDuration} min • {preset.cyclesBeforeLongBreak} cycles
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApplyPreset(preset)}
                      >
                        Apply
                      </Button>
                      {!['1', '2', '3', '4'].includes(preset.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePreset(preset.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sound enabled */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationSettings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <div>
                    <Label>Sound Alerts</Label>
                    <p className="text-xs text-muted-foreground">Play sound when timer ends</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => onUpdateNotificationSettings({ soundEnabled: checked })}
                />
              </div>

              {/* Sound volume */}
              {notificationSettings.soundEnabled && (
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between">
                    <Label className="text-sm">Volume</Label>
                    <span className="text-sm">{Math.round(notificationSettings.soundVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[notificationSettings.soundVolume * 100]}
                    onValueChange={([value]) => onUpdateNotificationSettings({ soundVolume: value / 100 })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              )}

              {/* Sound selection */}
              {notificationSettings.soundEnabled && (
                <div className="space-y-2 pl-7">
                  <Label className="text-sm">Alert Sound</Label>
                  <Select
                    value={notificationSettings.selectedSound}
                    onValueChange={(value) => onUpdateNotificationSettings({ selectedSound: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {soundUrls.map((sound) => (
                        <SelectItem key={sound} value={sound}>
                          {formatSoundLabel(sound)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Browser notifications */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {notificationSettings.notificationEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  <div>
                    <Label>Browser Notifications</Label>
                    <p className="text-xs text-muted-foreground">Show notification when timer ends</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.notificationEnabled}
                  onCheckedChange={(checked) => onUpdateNotificationSettings({ notificationEnabled: checked })}
                />
              </div>

              {/* Vibration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <div>
                    <Label>Vibration</Label>
                    <p className="text-xs text-muted-foreground">Vibrate on mobile devices</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.vibrationEnabled}
                  onCheckedChange={(checked) => onUpdateNotificationSettings({ vibrationEnabled: checked })}
                />
              </div>

              {/* Test button */}
              <Button onClick={onTestNotification} variant="outline" className="w-full">
                Test Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => onUpdateThemeSettings({ theme })}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                        themeSettings.theme === theme
                          ? 'border-[#4062ff] bg-[#4062ff]/5'
                          : 'border-muted hover:border-[#4062ff]/30'
                      )}
                    >
                      {theme === 'light' && <Sun className="w-5 h-5" />}
                      {theme === 'dark' && <Moon className="w-5 h-5" />}
                      {theme === 'system' && <Monitor className="w-5 h-5" />}
                      <span className="text-sm capitalize">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Size
                </Label>
                <Select
                  value={themeSettings.fontSize}
                  onValueChange={(value) => onUpdateThemeSettings({ fontSize: value as FontSize })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* High contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="w-5 h-5" />
                  <div>
                    <Label>High Contrast</Label>
                    <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                </div>
                <Switch
                  checked={themeSettings.highContrast}
                  onCheckedChange={(checked) => onUpdateThemeSettings({ highContrast: checked })}
                />
              </div>

              {/* Reduce motion */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reduce Motion</Label>
                  <p className="text-xs text-muted-foreground">Minimize animations</p>
                </div>
                <Switch
                  checked={themeSettings.reduceMotion}
                  onCheckedChange={(checked) => onUpdateThemeSettings({ reduceMotion: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Clearing all data will permanently delete your tasks, sessions, and settings. This action cannot be undone.
              </p>
              
              {!showClearConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full"
                >
                  Clear All Data
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1"
                  >
                    Confirm Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
