import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, TestTube, Calendar, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  saveOvulationTest, 
  loadOvulationTests, 
  deleteOvulationTest,
  predictOvulationFromTests,
  OvulationTest 
} from '@/lib/ovulationTestStorage';
import { useMobileBackButton } from '@/hooks/useMobileBackButton';
import { useBackNavigation } from '@/hooks/useBackNavigation';

const OvulationTestPage = () => {
  const goBack = useBackNavigation("tools");
  useMobileBackButton();
  
  const [tests, setTests] = useState<OvulationTest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState<Partial<OvulationTest>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    result: 'negative',
    brand: '',
    notes: ''
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = () => {
    const loadedTests = loadOvulationTests();
    setTests(loadedTests.sort((a, b) => 
      new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
    ));
  };

  const handleSaveTest = () => {
    if (!newTest.date || !newTest.result) {
      toast.error('Please fill in required fields');
      return;
    }

    const validResults: OvulationTest['result'][] = ['positive', 'negative', 'faint', 'peak'];
    const result = validResults.includes(newTest.result as OvulationTest['result']) 
      ? newTest.result as OvulationTest['result'] 
      : 'negative';

    const test: OvulationTest = {
      id: `ovtest-${Date.now()}`,
      date: newTest.date!,
      time: newTest.time || format(new Date(), 'HH:mm'),
      result,
      brand: newTest.brand,
      notes: newTest.notes
    };

    saveOvulationTest(test);
    loadTests();
    setIsDialogOpen(false);
    setNewTest({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      result: 'negative',
      brand: '',
      notes: ''
    });
    toast.success('Ovulation test logged');
  };

  const handleDeleteTest = (id: string) => {
    deleteOvulationTest(id);
    loadTests();
    toast.success('Test deleted');
  };

  const predictedOvulation = predictOvulationFromTests();
  const positiveTests = tests.filter(t => t.result === 'positive' || t.result === 'peak');

  const getResultColor = (result: string) => {
    switch (result) {
      case 'positive': return 'bg-green-500';
      case 'peak': return 'bg-purple-500';
      case 'faint': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'positive': return 'Positive';
      case 'peak': return 'Peak';
      case 'faint': return 'Faint Line';
      default: return 'Negative';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
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
            <h1 className="text-lg font-semibold">Ovulation Tests</h1>
            <p className="text-xs opacity-90">Track your LH surge</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Prediction Card */}
        {predictedOvulation && (
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-full">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Predicted Ovulation</p>
                  <p className="font-semibold text-foreground">
                    {format(predictedOvulation, 'EEEE, MMMM d')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-500">{tests.length}</p>
              <p className="text-xs text-muted-foreground">Total Tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-500">{positiveTests.length}</p>
              <p className="text-xs text-muted-foreground">Positive/Peak</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Test Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="h-4 w-4 mr-2" />
              Log Ovulation Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Log Ovulation Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newTest.date}
                  onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newTest.time}
                  onChange={(e) => setNewTest({ ...newTest, time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Result</label>
                <Select
                  value={newTest.result}
                  onValueChange={(value: string) => setNewTest({ ...newTest, result: value as 'positive' | 'negative' | 'faint' | 'peak' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="faint">Faint Line</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="peak">Peak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Brand (optional)</label>
                <Input
                  placeholder="e.g., Clearblue, First Response"
                  value={newTest.brand}
                  onChange={(e) => setNewTest({ ...newTest, brand: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  placeholder="Any additional notes..."
                  value={newTest.notes}
                  onChange={(e) => setNewTest({ ...newTest, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveTest} className="w-full">
                Save Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Test History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tests logged yet. Start tracking your ovulation tests!
              </p>
            ) : (
              tests.map((test) => (
                <div 
                  key={test.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getResultColor(test.result)}`} />
                    <div>
                      <p className="text-sm font-medium">{getResultLabel(test.result)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(test.date), 'MMM d, yyyy')} at {test.time}
                      </p>
                      {test.brand && (
                        <p className="text-xs text-muted-foreground">{test.brand}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTest(test.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Testing Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>• Test at the same time daily, ideally between 10am-8pm</p>
            <p>• Avoid drinking excess fluids 2 hours before testing</p>
            <p>• A positive result means ovulation likely occurs in 24-36 hours</p>
            <p>• Peak reading indicates highest LH surge detected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OvulationTestPage;
