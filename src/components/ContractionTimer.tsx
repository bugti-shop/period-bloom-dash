import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Square, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Contraction,
  ContractionSession,
  loadContractionSessions,
  addContractionSession,
  deleteContractionSession,
  calculateFrequency,
  detectPattern,
  updateContractionSession,
} from "@/lib/contractionStorage";
import { scheduleContractionAlert } from "@/lib/contractionNotifications";

export const ContractionTimer = () => {
  const [currentSession, setCurrentSession] = useState<ContractionSession | null>(null);
  const [activeContraction, setActiveContraction] = useState<Contraction | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState<ContractionSession[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSessions(loadContractionSessions());
  }, []);

  useEffect(() => {
    if (activeContraction) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - activeContraction.startTime) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setElapsedTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeContraction]);

  const startNewSession = () => {
    const session: ContractionSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      contractions: [],
      createdAt: Date.now(),
    };
    setCurrentSession(session);
    toast({
      title: "Session started",
      description: "Begin timing your contractions",
    });
  };

  const startContraction = () => {
    const contraction: Contraction = {
      id: Date.now().toString(),
      startTime: Date.now(),
    };
    setActiveContraction(contraction);
  };

  const stopContraction = () => {
    if (activeContraction && currentSession) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - activeContraction.startTime) / 1000);
      
      const completedContraction: Contraction = {
        ...activeContraction,
        endTime,
        duration,
      };

      const updatedSession = {
        ...currentSession,
        contractions: [...currentSession.contractions, completedContraction],
      };

      setCurrentSession(updatedSession);
      setActiveContraction(null);
      setElapsedTime(0);

      // Check if contractions are regular and schedule notification
      scheduleContractionAlert(updatedSession);

      toast({
        title: "Contraction recorded",
        description: `Duration: ${duration} seconds`,
      });
    }
  };

  const endSession = () => {
    if (currentSession) {
      if (currentSession.contractions.length === 0) {
        setCurrentSession(null);
        toast({
          title: "Session cancelled",
          description: "No contractions recorded",
        });
        return;
      }

      addContractionSession(currentSession);
      setSessions([...sessions, currentSession]);
      setCurrentSession(null);
      setActiveContraction(null);
      toast({
        title: "Session saved",
        description: `${currentSession.contractions.length} contractions recorded`,
      });
    }
  };

  const deleteSession = (sessionId: string) => {
    deleteContractionSession(sessionId);
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({
      title: "Session deleted",
      description: "Contraction session removed",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-900">Contraction Timer</h3>
        </div>
      </div>

      {!currentSession ? (
        <Button onClick={startNewSession} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
          <Play className="w-4 h-4 mr-2" />
          Start New Session
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Active Timer */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-gray-600">
                {activeContraction ? "Contraction in progress" : "Ready to time"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!activeContraction ? (
                <Button
                  onClick={startContraction}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={stopContraction}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              <Button
                onClick={endSession}
                variant="outline"
                disabled={activeContraction !== null}
              >
                End Session
              </Button>
            </div>
          </div>

          {/* Current Session Stats */}
          {currentSession.contractions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Current Session</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contractions:</span>
                  <span className="font-semibold">{currentSession.contractions.length}</span>
                </div>
                {currentSession.contractions.length >= 2 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-semibold">
                        Every {calculateFrequency(currentSession.contractions)} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Duration:</span>
                      <span className="font-semibold">
                        {Math.round(
                          currentSession.contractions
                            .filter(c => c.duration)
                            .reduce((sum, c) => sum + (c.duration || 0), 0) /
                            currentSession.contractions.filter(c => c.duration).length
                        )} sec
                      </span>
                    </div>
                  </>
                )}
              </div>
              {currentSession.contractions.length >= 3 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm font-medium text-gray-900">
                    {detectPattern(currentSession.contractions)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Previous Sessions */}
      {sessions.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Previous Sessions</h4>
          <div className="space-y-2">
            {sessions.slice().reverse().map((session) => (
              <div
                key={session.id}
                className="bg-gray-50 rounded-lg p-3 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {format(new Date(session.date), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {session.contractions.length} contractions
                    {session.contractions.length >= 2 && (
                      <> • Every {calculateFrequency(session.contractions)} min</>
                    )}
                  </div>
                  {session.contractions.length >= 3 && (
                    <div className="text-xs text-gray-700 mt-1 font-medium">
                      {detectPattern(session.contractions)}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSession(session.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
