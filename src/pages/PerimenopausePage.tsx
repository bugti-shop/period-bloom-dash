import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flame, Moon, Brain, Heart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  loadPerimenopauseData,
  savePerimenopauseData,
  addHotFlash,
  addNightSweat,
  addSleepIssue,
  addMoodChange,
  getPerimenopauseInsights,
  HotFlashEntry,
  NightSweatEntry,
  SleepIssueEntry,
  MoodChangeEntry
} from '@/lib/specialModeStorage';
import { useMobileBackButton } from '@/hooks/useMobileBackButton';
import { useBackNavigation } from '@/hooks/useBackNavigation';

const PerimenopausePage = () => {
  const goBack = useBackNavigation();
  useMobileBackButton();
  
  const [data, setData] = useState(loadPerimenopauseData());
  const [activeTab, setActiveTab] = useState('hotflashes');
  const [isHotFlashDialogOpen, setIsHotFlashDialogOpen] = useState(false);
  const [isNightSweatDialogOpen, setIsNightSweatDialogOpen] = useState(false);
  const [isSleepDialogOpen, setIsSleepDialogOpen] = useState(false);
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
  
  const [newHotFlash, setNewHotFlash] = useState<Partial<HotFlashEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    severity: 3,
    duration: 5
  });
  
  const [newNightSweat, setNewNightSweat] = useState<Partial<NightSweatEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    severity: 3,
    wokenUp: false
  });
  
  const [newSleepIssue, setNewSleepIssue] = useState<Partial<SleepIssueEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'insomnia',
    hoursSlept: 6
  });
  
  const [newMood, setNewMood] = useState<Partial<MoodChangeEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: 'neutral',
    anxiety: 3,
    irritability: 3
  });

  const insights = getPerimenopauseInsights();

  const handleToggleEnabled = (enabled: boolean) => {
    const updatedData = { ...data, enabled };
    if (enabled && !data.startDate) {
      updatedData.startDate = new Date().toISOString();
    }
    savePerimenopauseData(updatedData);
    setData(updatedData);
    toast.success(enabled ? 'Perimenopause mode enabled' : 'Perimenopause mode disabled');
  };

  const handleSaveHotFlash = () => {
    const severity = Math.min(5, Math.max(1, newHotFlash.severity || 3)) as 1 | 2 | 3 | 4 | 5;
    const entry: HotFlashEntry = {
      id: `hf-${Date.now()}`,
      date: newHotFlash.date!,
      time: newHotFlash.time!,
      severity,
      duration: newHotFlash.duration!,
      triggers: []
    };
    addHotFlash(entry);
    setData(loadPerimenopauseData());
    setIsHotFlashDialogOpen(false);
    toast.success('Hot flash logged');
  };

  const handleSaveNightSweat = () => {
    const severity = Math.min(5, Math.max(1, newNightSweat.severity || 3)) as 1 | 2 | 3 | 4 | 5;
    const entry: NightSweatEntry = {
      id: `ns-${Date.now()}`,
      date: newNightSweat.date!,
      severity,
      wokenUp: newNightSweat.wokenUp!
    };
    addNightSweat(entry);
    setData(loadPerimenopauseData());
    setIsNightSweatDialogOpen(false);
    toast.success('Night sweat logged');
  };

  const handleSaveSleepIssue = () => {
    const validTypes: SleepIssueEntry['type'][] = ['insomnia', 'waking', 'restless', 'other'];
    const type = validTypes.includes(newSleepIssue.type as SleepIssueEntry['type']) 
      ? newSleepIssue.type as SleepIssueEntry['type'] 
      : 'other';
    const entry: SleepIssueEntry = {
      id: `sl-${Date.now()}`,
      date: newSleepIssue.date!,
      type,
      hoursSlept: newSleepIssue.hoursSlept!
    };
    addSleepIssue(entry);
    setData(loadPerimenopauseData());
    setIsSleepDialogOpen(false);
    toast.success('Sleep issue logged');
  };

  const handleSaveMood = () => {
    const anxiety = Math.min(5, Math.max(1, newMood.anxiety || 3)) as 1 | 2 | 3 | 4 | 5;
    const irritability = Math.min(5, Math.max(1, newMood.irritability || 3)) as 1 | 2 | 3 | 4 | 5;
    const entry: MoodChangeEntry = {
      id: `mc-${Date.now()}`,
      date: newMood.date!,
      mood: newMood.mood!,
      anxiety,
      irritability
    };
    addMoodChange(entry);
    setData(loadPerimenopauseData());
    setIsMoodDialogOpen(false);
    toast.success('Mood logged');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Perimenopause Mode</h1>
            <p className="text-xs opacity-90">Track your transition symptoms</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Enable Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Perimenopause Tracking</p>
                <p className="text-xs text-muted-foreground">
                  Track symptoms specific to perimenopause
                </p>
              </div>
              <Switch 
                checked={data.enabled} 
                onCheckedChange={handleToggleEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <Card className="bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Weekly Insights</h3>
              {insights.map((insight, i) => (
                <p key={i} className="text-sm text-muted-foreground">• {insight}</p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-lg font-bold">{data.hotFlashes.length}</p>
              <p className="text-xs text-muted-foreground">Hot Flashes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Moon className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold">{data.nightSweats.length}</p>
              <p className="text-xs text-muted-foreground">Night Sweats</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different tracking */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="hotflashes" className="text-xs">Hot Flashes</TabsTrigger>
            <TabsTrigger value="nightsweats" className="text-xs">Night Sweats</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs">Sleep</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs">Mood</TabsTrigger>
          </TabsList>

          <TabsContent value="hotflashes" className="space-y-3 mt-4">
            <Dialog open={isHotFlashDialogOpen} onOpenChange={setIsHotFlashDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Log Hot Flash
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Hot Flash</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Date & Time</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={newHotFlash.date}
                        onChange={(e) => setNewHotFlash({...newHotFlash, date: e.target.value})}
                      />
                      <Input
                        type="time"
                        value={newHotFlash.time}
                        onChange={(e) => setNewHotFlash({...newHotFlash, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm">Severity: {newHotFlash.severity}/5</label>
                    <Slider
                      value={[newHotFlash.severity || 3]}
                      onValueChange={([v]) => setNewHotFlash({...newHotFlash, severity: Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5})}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={newHotFlash.duration}
                      onChange={(e) => setNewHotFlash({...newHotFlash, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <Button onClick={handleSaveHotFlash} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.hotFlashes.slice(-10).reverse().map((hf) => (
              <Card key={hf.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Severity: {hf.severity}/5</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(hf.date), 'MMM d')} at {hf.time} • {hf.duration} min
                    </p>
                  </div>
                  <Flame className="h-5 w-5 text-orange-500" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="nightsweats" className="space-y-3 mt-4">
            <Dialog open={isNightSweatDialogOpen} onOpenChange={setIsNightSweatDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Log Night Sweat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Night Sweat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Date</label>
                    <Input
                      type="date"
                      value={newNightSweat.date}
                      onChange={(e) => setNewNightSweat({...newNightSweat, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Severity: {newNightSweat.severity}/5</label>
                    <Slider
                      value={[newNightSweat.severity || 3]}
                      onValueChange={([v]) => setNewNightSweat({...newNightSweat, severity: Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5})}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Woke you up?</label>
                    <Switch
                      checked={newNightSweat.wokenUp}
                      onCheckedChange={(v) => setNewNightSweat({...newNightSweat, wokenUp: v})}
                    />
                  </div>
                  <Button onClick={handleSaveNightSweat} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.nightSweats.slice(-10).reverse().map((ns) => (
              <Card key={ns.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Severity: {ns.severity}/5</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ns.date), 'MMM d, yyyy')} {ns.wokenUp && '• Woke up'}
                    </p>
                  </div>
                  <Moon className="h-5 w-5 text-blue-500" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="sleep" className="space-y-3 mt-4">
            <Dialog open={isSleepDialogOpen} onOpenChange={setIsSleepDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Log Sleep Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Sleep Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Date</label>
                    <Input
                      type="date"
                      value={newSleepIssue.date}
                      onChange={(e) => setNewSleepIssue({...newSleepIssue, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Type</label>
                    <Select
                      value={newSleepIssue.type}
                      onValueChange={(v: string) => setNewSleepIssue({...newSleepIssue, type: v as 'insomnia' | 'waking' | 'restless' | 'other'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="insomnia">Insomnia</SelectItem>
                        <SelectItem value="waking">Frequent Waking</SelectItem>
                        <SelectItem value="restless">Restless Sleep</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Hours Slept</label>
                    <Input
                      type="number"
                      value={newSleepIssue.hoursSlept}
                      onChange={(e) => setNewSleepIssue({...newSleepIssue, hoursSlept: parseFloat(e.target.value)})}
                      step="0.5"
                    />
                  </div>
                  <Button onClick={handleSaveSleepIssue} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.sleepIssues.slice(-10).reverse().map((si) => (
              <Card key={si.id}>
                <CardContent className="p-3">
                  <p className="text-sm font-medium capitalize">{si.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(si.date), 'MMM d, yyyy')} • {si.hoursSlept} hours
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mood" className="space-y-3 mt-4">
            <Dialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Log Mood
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Mood Changes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Date</label>
                    <Input
                      type="date"
                      value={newMood.date}
                      onChange={(e) => setNewMood({...newMood, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Overall Mood</label>
                    <Select
                      value={newMood.mood}
                      onValueChange={(v) => setNewMood({...newMood, mood: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                        <SelectItem value="anxious">Anxious</SelectItem>
                        <SelectItem value="irritable">Irritable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Anxiety Level: {newMood.anxiety}/5</label>
                    <Slider
                      value={[newMood.anxiety || 3]}
                      onValueChange={([v]) => setNewMood({...newMood, anxiety: Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5})}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Irritability: {newMood.irritability}/5</label>
                    <Slider
                      value={[newMood.irritability || 3]}
                      onValueChange={([v]) => setNewMood({...newMood, irritability: Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5})}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <Button onClick={handleSaveMood} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.moodChanges.slice(-10).reverse().map((mc) => (
              <Card key={mc.id}>
                <CardContent className="p-3">
                  <p className="text-sm font-medium capitalize">{mc.mood}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(mc.date), 'MMM d, yyyy')} • Anxiety: {mc.anxiety}/5 • Irritability: {mc.irritability}/5
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerimenopausePage;
