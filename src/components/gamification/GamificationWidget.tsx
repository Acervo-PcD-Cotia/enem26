import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Zap,
  Target,
  Award,
  Medal,
  Crown,
  BookOpen,
  Brain,
  CheckCircle,
  Lock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  points: number | null;
  unlocked?: boolean;
  unlocked_at?: string;
}

const iconMap: Record<string, React.ElementType> = {
  flame: Flame,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  medal: Medal,
  crown: Crown,
  book: BookOpen,
  brain: Brain,
  check: CheckCircle,
  trophy: Trophy,
};

const motivationalMessages = [
  "Cada página estudada é um passo mais perto do seu sonho! 📚",
  "Você está construindo seu futuro, um assunto de cada vez! 🚀",
  "A constância vence o talento. Continue firme! 💪",
  "Grandes conquistas começam com pequenos passos diários! ⭐",
  "Seu esforço de hoje é o resultado de amanhã! 🎯",
  "Não desista agora, você já chegou longe! 🔥",
  "O ENEM não vai saber o que o atingiu! 😤",
  "Cada erro é uma lição, cada acerto uma vitória! ✨",
];

interface GamificationProps {
  compact?: boolean;
}

export function GamificationWidget({ compact = false }: GamificationProps) {
  const { user, profile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % motivationalMessages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAchievements = async () => {
    const [achievementsRes, userAchievementsRes] = await Promise.all([
      supabase.from("achievements").select("*").order("points"),
      supabase.from("user_achievements").select("achievement_id").eq("user_id", user?.id),
    ]);

    if (achievementsRes.data) {
      const unlockedIds = userAchievementsRes.data?.map(ua => ua.achievement_id) || [];
      const merged = achievementsRes.data.map(a => ({
        ...a,
        unlocked: unlockedIds.includes(a.id),
      }));
      setAchievements(merged);
      setUserAchievements(unlockedIds);
      
      const points = merged
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + (a.points || 0), 0);
      setTotalPoints(points);
    }
  };

  const streakDays = profile?.streak_count || 0;
  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4"
      >
        {/* Motivational Message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-center text-muted-foreground italic"
          >
            {motivationalMessages[currentMessage]}
          </motion.p>
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="flex items-center justify-around mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-energy">
              <Flame className="w-5 h-5" />
              <span className="text-xl font-bold">{streakDays}</span>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Trophy className="w-5 h-5" />
              <span className="text-xl font-bold">{unlockedCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Star className="w-5 h-5" />
              <span className="text-xl font-bold">{totalPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pontos</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-energy/10"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg text-center font-medium"
          >
            {motivationalMessages[currentMessage]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 text-center bg-energy/5"
        >
          <Flame className="w-8 h-8 text-energy mx-auto mb-2" />
          <p className="text-2xl font-bold text-energy">{streakDays}</p>
          <p className="text-xs text-muted-foreground">dias de streak</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 text-center bg-amber-500/5"
        >
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-500">{unlockedCount}/{totalCount}</p>
          <p className="text-xs text-muted-foreground">conquistas</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4 text-center bg-primary/5"
        >
          <Star className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">pontos totais</p>
        </motion.div>
      </div>

      {/* Progress to Next Level */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progresso de Conquistas</span>
          <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement, index) => {
          const IconComponent = iconMap[achievement.icon || 'trophy'] || Trophy;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card rounded-xl p-3 text-center transition-all ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-amber-500/10 to-energy/10' 
                  : 'opacity-50 grayscale'
              }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                achievement.unlocked ? 'bg-amber-500/20' : 'bg-muted'
              }`}>
                {achievement.unlocked ? (
                  <IconComponent className="w-6 h-6 text-amber-500" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs font-medium line-clamp-2">{achievement.name}</p>
              {achievement.unlocked && (
                <p className="text-xs text-amber-500 mt-1">+{achievement.points} pts</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
