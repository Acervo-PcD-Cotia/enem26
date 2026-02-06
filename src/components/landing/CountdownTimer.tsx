import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  // ENEM+ 2026 - Primeiro domingo de novembro de 2026 (estimativa: 1 de novembro de 2026)
  const enemDate = new Date("2026-11-01T00:00:00");
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const now = new Date();
    const difference = enemDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { value: timeLeft.days, label: "dias" },
    { value: timeLeft.hours, label: "horas" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "seg" },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card max-w-lg mx-auto">
      <p className="text-sm text-muted-foreground mb-4 font-medium">
        ⏱️ Tempo até o ENEM+ 2026
      </p>
      <div className="grid grid-cols-4 gap-3">
        {timeBlocks.map((block, index) => (
          <motion.div
            key={block.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="bg-secondary rounded-xl p-3 mb-1">
              <span className="text-2xl md:text-3xl font-bold text-gradient-primary">
                {String(block.value).padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {block.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
