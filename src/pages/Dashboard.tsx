import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  BookOpen, 
  Brain, 
  LogOut, 
  ChevronRight,
  Loader2,
  Timer,
  Sparkles,
  RotateCcw,
  Target,
} from "lucide-react";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { PomodoroTimer } from "@/components/dashboard/PomodoroTimer";
import { AppTour } from "@/components/tour/AppTour";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PrimaryTask {
  type: 'overdue_review' | 'today_review' | 'next_subject';
  title: string;
  subtitle: string;
  route: string;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [primaryTask, setPrimaryTask] = useState<PrimaryTask | null>(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [taskLoading, setTaskLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPrimaryTask();
    }
  }, [user]);

  const fetchPrimaryTask = async () => {
    setTaskLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // 1. Check overdue reviews
    const { data: overdueReviews } = await supabase
      .from("rpa_reviews")
      .select("id, subject:subjects(name, discipline:disciplines(name, color))")
      .eq("user_id", user?.id)
      .eq("status", "pending")
      .lt("scheduled_date", today)
      .limit(1);

    if (overdueReviews && overdueReviews.length > 0) {
      const r: any = overdueReviews[0];
      setPrimaryTask({
        type: 'overdue_review',
        title: `Revisão: ${r.subject?.name || 'Assunto'}`,
        subtitle: 'Revisão atrasada — não deixe escapar!',
        route: '/reviews',
        color: 'destructive',
      });
      await fetchProgress(today);
      setTaskLoading(false);
      return;
    }

    // 2. Check today's reviews
    const { data: todayReviews } = await supabase
      .from("rpa_reviews")
      .select("id, subject:subjects(name, discipline:disciplines(name, color))")
      .eq("user_id", user?.id)
      .eq("status", "pending")
      .eq("scheduled_date", today)
      .limit(1);

    if (todayReviews && todayReviews.length > 0) {
      const r: any = todayReviews[0];
      setPrimaryTask({
        type: 'today_review',
        title: `Revisão: ${r.subject?.name || 'Assunto'}`,
        subtitle: 'Programada para hoje',
        route: '/reviews',
        color: 'success',
      });
      await fetchProgress(today);
      setTaskLoading(false);
      return;
    }

    // 3. Next subject in study trail
    const { data: nextSubject } = await supabase
      .from("user_subject_progress")
      .select("subject:subjects(name, discipline:disciplines(name, color))")
      .eq("user_id", user?.id)
      .eq("status", "studying")
      .limit(1);

    if (nextSubject && nextSubject.length > 0) {
      const s: any = nextSubject[0];
      setPrimaryTask({
        type: 'next_subject',
        title: s.subject?.name || 'Próximo assunto',
        subtitle: 'Continue de onde parou',
        route: '/subjects',
        color: 'primary',
      });
    } else {
      setPrimaryTask({
        type: 'next_subject',
        title: 'Comece uma trilha de estudo',
        subtitle: 'Escolha um assunto para estudar',
        route: '/subjects',
        color: 'primary',
      });
    }

    await fetchProgress(today);
    setTaskLoading(false);
  };

  const fetchProgress = async (today: string) => {
    // Count today's completed reviews + sessions
    const { count: completedReviews } = await supabase
      .from("rpa_reviews")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", user?.id)
      .eq("status", "completed")
      .eq("completed_date", today);

    const { count: pendingReviews } = await supabase
      .from("rpa_reviews")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", user?.id)
      .eq("status", "pending")
      .lte("scheduled_date", today);

    const done = completedReviews || 0;
    const pending = pendingReviews || 0;
    setCompletedToday(done);
    setTotalToday(done + pending);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppTour />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Olá,</p>
                <p className="font-semibold">{profile.full_name || "Estudante"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Discrete check-in icon */}
              <button
                onClick={() => navigate("/checkin")}
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                title="Check-in Semanal"
              >
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Streak */}
              <div className="flex items-center gap-1.5 bg-energy/10 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-energy" />
                <span className="font-semibold text-energy">{profile.streak_count || 0}</span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Pomodoro Toggle */}
        <AnimatePresence mode="wait">
          {showPomodoro ? (
            <motion.div
              key="pomodoro"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <PomodoroTimer />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPomodoro(false)}
                className="w-full mt-2"
              >
                Minimizar timer
              </Button>
            </motion.div>
          ) : (
            <motion.button
              key="pomodoro-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPomodoro(true)}
              className="w-full glass-card rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              data-tour="pomodoro"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Timer Pomodoro</p>
                  <p className="text-sm text-muted-foreground">Inicie uma sessão de foco</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Day Progress - simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", { 
                  weekday: "long", 
                  day: "numeric", 
                  month: "long" 
                })}
              </p>
            </div>
            {totalToday > 0 && (
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{completedToday}/{totalToday}</span>
              </div>
            )}
          </div>
          
          {totalToday > 0 && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-primary rounded-full"
              />
            </div>
          )}
        </motion.div>

        {/* PRIMARY TASK — Focus Absolute */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {taskLoading ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : primaryTask ? (
            <button
              onClick={() => navigate(primaryTask.route)}
              className={`w-full glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-all border-l-4 ${
                primaryTask.color === 'destructive' 
                  ? 'border-destructive bg-destructive/5' 
                  : primaryTask.color === 'success'
                  ? 'border-success bg-success/5'
                  : 'border-primary bg-primary/5'
              }`}
            >
              <p className="text-sm text-muted-foreground mb-2">
                Faça isso agora. O resto vem depois.
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  primaryTask.color === 'destructive' 
                    ? 'bg-destructive/10' 
                    : primaryTask.color === 'success'
                    ? 'bg-success/10'
                    : 'bg-primary/10'
                }`}>
                  {primaryTask.type === 'next_subject' 
                    ? <BookOpen className={`w-7 h-7 ${
                        primaryTask.color === 'primary' ? 'text-primary' : 'text-success'
                      }`} />
                    : primaryTask.type === 'overdue_review'
                    ? <RotateCcw className="w-7 h-7 text-destructive" />
                    : <Brain className="w-7 h-7 text-success" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold">{primaryTask.title}</p>
                  <p className="text-sm text-muted-foreground">{primaryTask.subtitle}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
            </button>
          ) : null}
        </motion.div>
      </main>

      <BottomNavigation currentRoute="dashboard" />
    </div>
  );
}
