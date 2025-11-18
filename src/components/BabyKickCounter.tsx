import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface KickSession {
  id: string;
  startTime: Date;
  kicks: { count: number; time: Date }[];
}

export const BabyKickCounter = () => {
  const [kickCount, setKickCount] = useState(0);
  const [kickStartTime, setKickStartTime] = useState<Date | null>(null);
  const [currentKicks, setCurrentKicks] = useState<{ count: number; time: Date }[]>([]);
  const [kickSessions, setKickSessions] = useState<KickSession[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [kickToDelete, setKickToDelete] = useState<{ sessionId: string; kickIndex: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedSessions = loadFromLocalStorage<KickSession[]>("kick-sessions") || [];
    setKickSessions(savedSessions.map(session => ({
      ...session,
      startTime: new Date(session.startTime),
      kicks: session.kicks.map(k => ({
        ...k,
        time: new Date(k.time)
      }))
    })));
  }, []);

  const recordKick = () => {
    if (kickCount === 0) {
      setKickStartTime(new Date());
    }
    const newCount = kickCount + 1;
    setKickCount(newCount);
    
    const newKick = { count: newCount, time: new Date() };
    setCurrentKicks([...currentKicks, newKick]);
  };

  const resetKicks = () => {
    if (kickCount > 0) {
      // Save the current session
      const newSession: KickSession = {
        id: Date.now().toString(),
        startTime: kickStartTime || new Date(),
        kicks: currentKicks
      };
      
      const updatedSessions = [newSession, ...kickSessions];
      setKickSessions(updatedSessions);
      saveToLocalStorage("kick-sessions", updatedSessions);
      
      toast({
        title: "Session saved",
        description: `Recorded ${kickCount} kicks`
      });
    }
    
    setKickCount(0);
    setKickStartTime(null);
    setCurrentKicks([]);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = kickSessions.filter(s => s.id !== sessionId);
    setKickSessions(updatedSessions);
    saveToLocalStorage("kick-sessions", updatedSessions);
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
    
    toast({
      title: "Session deleted",
      description: "Kick counting session has been removed"
    });
  };

  const deleteKickFromSession = (sessionId: string, kickIndex: number) => {
    const updatedSessions = kickSessions.map(session => {
      if (session.id === sessionId) {
        const updatedKicks = session.kicks.filter((_, index) => index !== kickIndex);
        // Re-number the kicks
        return {
          ...session,
          kicks: updatedKicks.map((kick, index) => ({
            ...kick,
            count: index + 1
          }))
        };
      }
      return session;
    });
    
    setKickSessions(updatedSessions);
    saveToLocalStorage("kick-sessions", updatedSessions);
    setKickToDelete(null);
    
    toast({
      title: "Kick deleted",
      description: "Individual kick entry has been removed"
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-500" />
            Baby Kick Counter
          </CardTitle>
          <CardDescription>Track your baby's movements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-700 mb-2">Kicks counted</p>
            <p className="text-5xl font-bold text-teal-600">{kickCount}</p>
            {kickStartTime && (
              <p className="text-xs text-teal-600 mt-2">
                Started at {format(kickStartTime, "h:mm a")}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={recordKick} className="w-full bg-teal-500 hover:bg-teal-600">
              Record Kick
            </Button>
            <Button onClick={resetKicks} variant="outline" className="w-full">
              {kickCount > 0 ? "Save & Reset" : "Reset"}
            </Button>
          </div>

          {currentKicks.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-sm">Current Session:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {currentKicks.map((kick, i) => (
                  <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>Kick #{kick.count}</span>
                    <span>{format(kick.time, "h:mm:ss a")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kickSessions.length > 0 && (
            <div className="space-y-3 mt-6 pt-4 border-t">
              <p className="font-semibold text-sm">Kick History ({kickSessions.length} sessions):</p>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {kickSessions.map((session) => (
                  <div key={session.id} className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {format(session.startTime, "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-xs text-gray-600">
                          Total kicks: {session.kicks.length}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSessionToDelete(session.id);
                          setDeleteDialogOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 pl-2">
                      {session.kicks.map((kick, kickIndex) => (
                        <div key={kickIndex} className="flex justify-between items-center text-xs bg-white p-2 rounded">
                          <span>Kick #{kick.count}</span>
                          <div className="flex items-center gap-2">
                            <span>{format(kick.time, "h:mm:ss a")}</span>
                            <button
                              onClick={() => setKickToDelete({ sessionId: session.id, kickIndex })}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            Tip: Count 10 kicks. It should take less than 2 hours.
          </p>
        </CardContent>
      </Card>

      {/* Delete Session Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this kick counting session. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && deleteSession(sessionToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Individual Kick Dialog */}
      <AlertDialog open={!!kickToDelete} onOpenChange={(open) => !open && setKickToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Kick Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this individual kick from the session. The remaining kicks will be re-numbered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKickToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kickToDelete && deleteKickFromSession(kickToDelete.sessionId, kickToDelete.kickIndex)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
