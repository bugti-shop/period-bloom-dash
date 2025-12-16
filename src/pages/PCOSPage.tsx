import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Pill, TrendingUp, Plus, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  loadPCOSData,
  savePCOSData,
  addPCOSSymptom,
  addPCOSMedication,
  addHairGrowthEntry,
  addAcneEntry,
  addPCOSWeightEntry,
  addCycleIrregularityEntry,
  getPCOSInsights,
  PCOSSymptom,
  PCOSMedication,
  HairGrowthEntry,
  AcneEntry,
  WeightEntry,
  CycleIrregularityEntry
} from '@/lib/specialModeStorage';
import { useMobileBackButton } from '@/hooks/useMobileBackButton';
import { useBackNavigation } from '@/hooks/useBackNavigation';

const PCOSPage = () => {
  const goBack = useBackNavigation();
  useMobileBackButton();
  
  const [data, setData] = useState(loadPCOSData());
  const [activeTab, setActiveTab] = useState('symptoms');
  const [isSymptomDialogOpen, setIsSymptomDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isCycleDialogOpen, setIsCycleDialogOpen] = useState(false);
  
  const [newSymptom, setNewSymptom] = useState<Partial<PCOSSymptom>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'fatigue',
    severity: 3,
    notes: ''
  });
  
  const [newMedication, setNewMedication] = useState<Partial<PCOSMedication>>({
    name: '',
    dosage: '',
    frequency: 'daily',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    type: 'metformin'
  });
  
  const [newWeight, setNewWeight] = useState<Partial<WeightEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    unit: 'kg'
  });
  
  const [newCycle, setNewCycle] = useState<Partial<CycleIrregularityEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    cycleLength: 28,
    periodLength: 5,
    flow: 'medium',
    notes: ''
  });

  const insights = getPCOSInsights();

  const handleToggleEnabled = (enabled: boolean) => {
    const updatedData = { ...data, enabled };
    if (enabled && !data.diagnosisDate) {
      updatedData.diagnosisDate = new Date().toISOString();
    }
    savePCOSData(updatedData);
    setData(updatedData);
    toast.success(enabled ? 'PCOS mode enabled' : 'PCOS mode disabled');
  };

  const handleToggleInsulinResistance = (value: boolean) => {
    const updatedData = { ...data, insulinResistance: value };
    savePCOSData(updatedData);
    setData(updatedData);
  };

  const handleSaveSymptom = () => {
    const validTypes: PCOSSymptom['type'][] = ['hirsutism', 'acne', 'hairLoss', 'weightGain', 'fatigue', 'moodSwings', 'other'];
    const type = validTypes.includes(newSymptom.type as PCOSSymptom['type']) 
      ? newSymptom.type as PCOSSymptom['type'] 
      : 'other';
    const severity = Math.min(5, Math.max(1, newSymptom.severity || 3)) as 1 | 2 | 3 | 4 | 5;
    
    const entry: PCOSSymptom = {
      id: `pcos-sym-${Date.now()}`,
      date: newSymptom.date!,
      type,
      severity,
      notes: newSymptom.notes
    };
    addPCOSSymptom(entry);
    setData(loadPCOSData());
    setIsSymptomDialogOpen(false);
    toast.success('Symptom logged');
  };

  const handleSaveMedication = () => {
    if (!newMedication.name) {
      toast.error('Please enter medication name');
      return;
    }
    const validMedTypes: PCOSMedication['type'][] = ['metformin', 'birthControl', 'spironolactone', 'clomid', 'letrozole', 'other'];
    const medType = validMedTypes.includes(newMedication.type as PCOSMedication['type']) 
      ? newMedication.type as PCOSMedication['type'] 
      : 'other';
    
    const entry: PCOSMedication = {
      id: `pcos-med-${Date.now()}`,
      name: newMedication.name!,
      dosage: newMedication.dosage!,
      frequency: newMedication.frequency!,
      startDate: newMedication.startDate!,
      type: medType
    };
    addPCOSMedication(entry);
    setData(loadPCOSData());
    setIsMedicationDialogOpen(false);
    toast.success('Medication added');
  };

  const handleSaveWeight = () => {
    if (!newWeight.weight || newWeight.weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }
    const validUnits: WeightEntry['unit'][] = ['kg', 'lbs'];
    const unit = validUnits.includes(newWeight.unit as WeightEntry['unit']) 
      ? newWeight.unit as WeightEntry['unit'] 
      : 'kg';
    
    const entry: WeightEntry = {
      id: `pcos-wt-${Date.now()}`,
      date: newWeight.date!,
      weight: newWeight.weight!,
      unit
    };
    addPCOSWeightEntry(entry);
    setData(loadPCOSData());
    setIsWeightDialogOpen(false);
    toast.success('Weight logged');
  };

  const handleSaveCycle = () => {
    const validFlows: CycleIrregularityEntry['flow'][] = ['light', 'medium', 'heavy'];
    const flow = validFlows.includes(newCycle.flow as CycleIrregularityEntry['flow']) 
      ? newCycle.flow as CycleIrregularityEntry['flow'] 
      : 'medium';
    
    const entry: CycleIrregularityEntry = {
      id: `pcos-cyc-${Date.now()}`,
      date: newCycle.date!,
      cycleLength: newCycle.cycleLength!,
      periodLength: newCycle.periodLength!,
      flow,
      notes: newCycle.notes
    };
    addCycleIrregularityEntry(entry);
    setData(loadPCOSData());
    setIsCycleDialogOpen(false);
    toast.success('Cycle data logged');
  };

  const getSymptomLabel = (type: string) => {
    const labels: Record<string, string> = {
      hirsutism: 'Excess Hair Growth',
      acne: 'Acne',
      hairLoss: 'Hair Loss',
      weightGain: 'Weight Gain',
      fatigue: 'Fatigue',
      moodSwings: 'Mood Swings',
      other: 'Other'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4">
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
            <h1 className="text-lg font-semibold">PCOS Mode</h1>
            <p className="text-xs opacity-90">Manage your PCOS symptoms</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Enable Toggle */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable PCOS Tracking</p>
                <p className="text-xs text-muted-foreground">
                  Track symptoms specific to PCOS
                </p>
              </div>
              <Switch 
                checked={data.enabled} 
                onCheckedChange={handleToggleEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Insulin Resistance</p>
                <p className="text-xs text-muted-foreground">
                  Do you have insulin resistance?
                </p>
              </div>
              <Switch 
                checked={data.insulinResistance} 
                onCheckedChange={handleToggleInsulinResistance}
              />
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <Card className="bg-teal-50 dark:bg-teal-900/20">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Monthly Insights</h3>
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
              <Activity className="h-5 w-5 mx-auto text-teal-500 mb-1" />
              <p className="text-lg font-bold">{data.symptoms.length}</p>
              <p className="text-xs text-muted-foreground">Symptoms Logged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Pill className="h-5 w-5 mx-auto text-cyan-500 mb-1" />
              <p className="text-lg font-bold">{data.medications.length}</p>
              <p className="text-xs text-muted-foreground">Medications</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different tracking */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="symptoms" className="text-xs">Symptoms</TabsTrigger>
            <TabsTrigger value="medications" className="text-xs">Meds</TabsTrigger>
            <TabsTrigger value="weight" className="text-xs">Weight</TabsTrigger>
            <TabsTrigger value="cycles" className="text-xs">Cycles</TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="space-y-3 mt-4">
            <Dialog open={isSymptomDialogOpen} onOpenChange={setIsSymptomDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Plus className="h-4 w-4 mr-2" /> Log Symptom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log PCOS Symptom</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Date</label>
                    <Input
                      type="date"
                      value={newSymptom.date}
                      onChange={(e) => setNewSymptom({...newSymptom, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Symptom Type</label>
                    <Select
                      value={newSymptom.type}
                      onValueChange={(v: string) => setNewSymptom({...newSymptom, type: v as 'hirsutism' | 'acne' | 'hairLoss' | 'weightGain' | 'fatigue' | 'moodSwings' | 'other'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hirsutism">Excess Hair Growth</SelectItem>
                        <SelectItem value="acne">Acne</SelectItem>
                        <SelectItem value="hairLoss">Hair Loss</SelectItem>
                        <SelectItem value="weightGain">Weight Gain</SelectItem>
                        <SelectItem value="fatigue">Fatigue</SelectItem>
                        <SelectItem value="moodSwings">Mood Swings</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Severity: {newSymptom.severity}/5</label>
                    <Slider
                      value={[newSymptom.severity || 3]}
                      onValueChange={([v]) => setNewSymptom({...newSymptom, severity: Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5})}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Notes (optional)</label>
                    <Textarea
                      value={newSymptom.notes}
                      onChange={(e) => setNewSymptom({...newSymptom, notes: e.target.value})}
                      placeholder="Any additional details..."
                    />
                  </div>
                  <Button onClick={handleSaveSymptom} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.symptoms.slice(-10).reverse().map((sym) => (
              <Card key={sym.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{getSymptomLabel(sym.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sym.date), 'MMM d, yyyy')} • Severity: {sym.severity}/5
                      </p>
                      {sym.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{sym.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="medications" className="space-y-3 mt-4">
            <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Plus className="h-4 w-4 mr-2" /> Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Medication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Medication Name</label>
                    <Input
                      value={newMedication.name}
                      onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                      placeholder="e.g., Metformin"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Type</label>
                    <Select
                      value={newMedication.type}
                      onValueChange={(v: string) => setNewMedication({...newMedication, type: v as 'metformin' | 'birthControl' | 'spironolactone' | 'clomid' | 'letrozole' | 'other'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metformin">Metformin</SelectItem>
                        <SelectItem value="birthControl">Birth Control</SelectItem>
                        <SelectItem value="spironolactone">Spironolactone</SelectItem>
                        <SelectItem value="clomid">Clomid</SelectItem>
                        <SelectItem value="letrozole">Letrozole</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Dosage</label>
                    <Input
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Frequency</label>
                    <Input
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                      placeholder="e.g., twice daily"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Start Date</label>
                    <Input
                      type="date"
                      value={newMedication.startDate}
                      onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleSaveMedication} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.medications.map((med) => (
              <Card key={med.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-teal-500" />
                    <div>
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {format(new Date(med.startDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="weight" className="space-y-3 mt-4">
            <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Plus className="h-4 w-4 mr-2" /> Log Weight
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Weight</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Date</label>
                    <Input
                      type="date"
                      value={newWeight.date}
                      onChange={(e) => setNewWeight({...newWeight, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Weight</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newWeight.weight || ''}
                        onChange={(e) => setNewWeight({...newWeight, weight: parseFloat(e.target.value)})}
                        placeholder="Enter weight"
                        step="0.1"
                      />
                      <Select
                        value={newWeight.unit}
                        onValueChange={(v: string) => setNewWeight({...newWeight, unit: v as 'kg' | 'lbs'})}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSaveWeight} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.weightTracking.slice(-10).reverse().map((wt) => (
              <Card key={wt.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-teal-500" />
                    <div>
                      <p className="text-sm font-medium">{wt.weight} {wt.unit}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(wt.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="cycles" className="space-y-3 mt-4">
            <Dialog open={isCycleDialogOpen} onOpenChange={setIsCycleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Plus className="h-4 w-4 mr-2" /> Log Cycle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Cycle Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Period Start Date</label>
                    <Input
                      type="date"
                      value={newCycle.date}
                      onChange={(e) => setNewCycle({...newCycle, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Cycle Length (days)</label>
                    <Input
                      type="number"
                      value={newCycle.cycleLength}
                      onChange={(e) => setNewCycle({...newCycle, cycleLength: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Period Length (days)</label>
                    <Input
                      type="number"
                      value={newCycle.periodLength}
                      onChange={(e) => setNewCycle({...newCycle, periodLength: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Flow</label>
                    <Select
                      value={newCycle.flow}
                      onValueChange={(v: string) => setNewCycle({...newCycle, flow: v as 'light' | 'medium' | 'heavy'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Notes (optional)</label>
                    <Textarea
                      value={newCycle.notes}
                      onChange={(e) => setNewCycle({...newCycle, notes: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleSaveCycle} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            {data.cycleIrregularity.slice(-10).reverse().map((cyc) => (
              <Card key={cyc.id}>
                <CardContent className="p-3">
                  <p className="text-sm font-medium">
                    {cyc.cycleLength}-day cycle • {cyc.periodLength}-day period
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(cyc.date), 'MMM d, yyyy')} • {cyc.flow} flow
                  </p>
                  {cyc.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{cyc.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* PCOS Tips */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PCOS Management Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>• Maintain a healthy weight through diet and exercise</p>
            <p>• Track your symptoms to identify patterns and triggers</p>
            <p>• Consider low-glycemic foods to help manage insulin</p>
            <p>• Regular check-ups with your healthcare provider are important</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PCOSPage;
