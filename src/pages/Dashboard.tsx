import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Flame, 
  BookOpen, 
  Brain, 
  HelpCircle, 
  PenTool, 
  LogOut, 
  Calendar,
  Trophy,
  Target,
  Clock,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

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

  // Mock data for today's tasks
  const todayTasks = [
    { id: 1, type: "study", title: "Funções Quadráticas", discipline: "Matemática", duration: "45 min", icon: BookOpen, color: "bg-primary" },
    { id: 2, type: "rpa_review", title: "Revisão: Cinemática", discipline: "Física", duration: "20 min", icon: Brain, color: "bg-success" },
    { id: 3, type: "questions", title: "10 Questões de História", discipline: "Humanas", duration: "30 min", icon: HelpCircle, color: "bg-energy" },
  ];

  const completedToday = 2;
  const totalToday = 5;
  const progressPercent = (completedToday / totalToday) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
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
            
            <div className="flex items-center gap-4">
              {/* Streak */}
              <div className="flex items-center gap-1.5 bg-energy/10 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-energy" />
                <span className="font-semibold text-energy">{profile.streak_count}</span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-success/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Hoje</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", { 
                  weekday: "long", 
                  day: "numeric", 
                  month: "long" 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{completedToday}/{totalToday}</p>
              <p className="text-sm text-muted-foreground">tarefas</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-primary rounded-full"
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold">2.5h</p>
            <p className="text-xs text-muted-foreground">estudadas</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <Target className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-lg font-bold">85%</p>
            <p className="text-xs text-muted-foreground">acertos</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <Trophy className="w-6 h-6 text-energy mx-auto mb-2" />
            <p className="text-lg font-bold">3</p>
            <p className="text-xs text-muted-foreground">conquistas</p>
          </motion.div>
        </div>

        {/* Today's Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">O que fazer agora</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver tudo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${task.color}/10 flex items-center justify-center`}>
                  <task.icon className={`w-6 h-6 ${task.color === "bg-primary" ? "text-primary" : task.color === "bg-success" ? "text-success" : "text-energy"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.discipline}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{task.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pending Reviews */}
        <section className="glass-card rounded-2xl p-6 bg-success/5 border-success/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Revisões RPA Pendentes</h3>
              <p className="text-sm text-muted-foreground">3 revisões para hoje</p>
            </div>
          </div>
          
          <Button className="w-full bg-success hover:bg-success/90 text-white">
            Iniciar revisões
          </Button>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 px-4 py-2">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <Flame className="w-6 h-6" />
            <span className="text-xs font-medium">Hoje</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Plano</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
            <Brain className="w-6 h-6" />
            <span className="text-xs">Revisões</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-6 h-6" />
            <span className="text-xs">Questões</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
            <PenTool className="w-6 h-6" />
            <span className="text-xs">Redação</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
