import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const TIMER_CONFIG = {
  focus: { minutes: 25, label: "Foco", color: "text-primary", bgColor: "bg-primary/10" },
  shortBreak: { minutes: 5, label: "Pausa curta", color: "text-success", bgColor: "bg-success/10" },
  longBreak: { minutes: 15, label: "Pausa longa", color: "text-amber-500", bgColor: "bg-amber-500/10" },
};

interface PomodoroTimerProps {
  onComplete?: (mode: TimerMode, duration: number) => void;
}

export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.focus.minutes * 60);
  const [sessions, setSessions] = useState(0);

  const config = TIMER_CONFIG[mode];
  const totalTime = config.minutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const resetTimer = useCallback(() => {
    setTimeLeft(TIMER_CONFIG[mode].minutes * 60);
    setIsRunning(false);
  }, [mode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode].minutes * 60);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      onComplete?.(mode, config.minutes);
      
      if (mode === "focus") {
        setSessions((prev) => prev + 1);
        // After 4 focus sessions, suggest a long break
        if ((sessions + 1) % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("shortBreak");
        }
      } else {
        switchMode("focus");
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessions, config.minutes, onComplete, switchMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-6 ${config.bgColor}`}
    >
      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-6">
        {(Object.keys(TIMER_CONFIG) as TimerMode[]).map((timerMode) => (
          <button
            key={timerMode}
            onClick={() => switchMode(timerMode)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === timerMode
                ? `${TIMER_CONFIG[timerMode].color} bg-background shadow-sm`
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {timerMode === "focus" && <BookOpen className="w-4 h-4 inline mr-1" />}
            {timerMode !== "focus" && <Coffee className="w-4 h-4 inline mr-1" />}
            {TIMER_CONFIG[timerMode].label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        {/* Progress Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={config.color}
            strokeDasharray={553}
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 - (progress / 100) * 553 }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${config.color}`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-muted-foreground mt-1">
            {sessions} sessões hoje
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setIsRunning(!isRunning)}
          size="lg"
          className={`rounded-full px-8 ${
            mode === "focus" 
              ? "bg-primary hover:bg-primary/90" 
              : mode === "shortBreak"
              ? "bg-success hover:bg-success/90"
              : "bg-amber-500 hover:bg-amber-600"
          }`}
        >
          <AnimatePresence mode="wait">
            {isRunning ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Pause className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Play className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
}
