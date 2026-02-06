import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  Calendar,
  ChevronRight,
  Plus,
  Loader2,
  FileText,
  BarChart3,
  Save,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

interface Essay {
  id: string;
  theme: string;
  content: string | null;
  scheduled_date: string;
  submitted_at: string | null;
  competency_1: number | null;
  competency_2: number | null;
  competency_3: number | null;
  competency_4: number | null;
  competency_5: number | null;
  total_score: number | null;
  feedback: string | null;
}

const competencyLabels = [
  "C1 - Norma Culta",
  "C2 - Tema e Repertório",
  "C3 - Argumentação",
  "C4 - Coesão",
  "C5 - Proposta de Intervenção",
];

const suggestedThemes = [
  "O impacto das redes sociais na saúde mental dos jovens",
  "Desafios para a educação inclusiva no Brasil",
  "A importância da preservação ambiental para as gerações futuras",
  "O papel da tecnologia no combate à desinformação",
  "Caminhos para garantir a segurança alimentar no Brasil",
];

export default function Essays() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [currentEssay, setCurrentEssay] = useState<Essay | null>(null);
  const [essayContent, setEssayContent] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEssays();
    }
  }, [user]);

  const fetchEssays = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("essays")
      .select("*")
      .eq("user_id", user?.id)
      .order("scheduled_date", { ascending: false });
    
    if (data) setEssays(data);
    setIsLoading(false);
  };

  const createEssay = async (theme: string) => {
    const { data, error } = await supabase
      .from("essays")
      .insert({
        user_id: user?.id,
        theme,
        scheduled_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao criar redação", variant: "destructive" });
      return;
    }

    setCurrentEssay(data);
    setEssayContent("");
    setShowEditor(true);
    setNewTheme("");
    fetchEssays();
  };

  const saveEssay = async () => {
    if (!currentEssay) return;

    const totalScore = scores.reduce((a, b) => a + b, 0);

    const { error } = await supabase
      .from("essays")
      .update({
        content: essayContent,
        submitted_at: new Date().toISOString(),
        competency_1: scores[0],
        competency_2: scores[1],
        competency_3: scores[2],
        competency_4: scores[3],
        competency_5: scores[4],
        total_score: totalScore,
      })
      .eq("id", currentEssay.id);

    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
      return;
    }

    toast({ title: "Redação salva!", description: `Nota total: ${totalScore} pontos` });
    setShowEditor(false);
    setCurrentEssay(null);
    fetchEssays();
  };

  const openEssay = (essay: Essay) => {
    setCurrentEssay(essay);
    setEssayContent(essay.content || "");
    setScores([
      essay.competency_1 || 0,
      essay.competency_2 || 0,
      essay.competency_3 || 0,
      essay.competency_4 || 0,
      essay.competency_5 || 0,
    ]);
    setShowEditor(true);
  };

  const lineCount = essayContent.split('\n').length;
  const averageScore = essays.length > 0 
    ? Math.round(essays.filter(e => e.total_score).reduce((a, e) => a + (e.total_score || 0), 0) / essays.filter(e => e.total_score).length) 
    : 0;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showEditor && (
                <Button variant="ghost" size="icon" onClick={() => setShowEditor(false)}>
                  <X className="w-5 h-5" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {showEditor ? "Escrever Redação" : "Redação ENEM"}
                </h1>
                {!showEditor && (
                  <p className="text-sm text-muted-foreground">
                    {essays.length} redações escritas
                  </p>
                )}
              </div>
            </div>
            {showEditor && (
              <Button onClick={saveEssay} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!showEditor ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 text-center">
                  <FileText className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{essays.length}</p>
                  <p className="text-xs text-muted-foreground">Redações</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold">{averageScore}</p>
                  <p className="text-xs text-muted-foreground">Média</p>
                </div>
              </div>

              {/* New Essay */}
              <section className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Nova Redação</h3>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Digite um tema..."
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                  />
                  <Button onClick={() => createEssay(newTheme)} disabled={!newTheme.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">Ou escolha um tema sugerido:</p>
                <div className="space-y-2">
                  {suggestedThemes.slice(0, 3).map((theme, i) => (
                    <button
                      key={i}
                      onClick={() => createEssay(theme)}
                      className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </section>

              {/* Essays List */}
              <section>
                <h3 className="font-semibold mb-4">Suas Redações</h3>
                <div className="space-y-3">
                  {essays.map((essay) => (
                    <motion.div
                      key={essay.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => openEssay(essay)}
                      className="glass-card rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{essay.theme}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(essay.scheduled_date).toLocaleDateString("pt-BR")}
                            {essay.total_score && (
                              <>
                                <span>•</span>
                                <span className="text-success font-medium">{essay.total_score} pts</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                  {essays.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma redação ainda.</p>
                      <p className="text-sm">Comece a praticar!</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Theme */}
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Tema:</p>
                <p className="font-medium">{currentEssay?.theme}</p>
              </div>

              {/* Editor */}
              <div className="relative">
                <Textarea
                  value={essayContent}
                  onChange={(e) => setEssayContent(e.target.value)}
                  placeholder="Escreva sua redação aqui..."
                  className="min-h-[300px] resize-none"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {lineCount}/30 linhas
                </div>
              </div>

              {/* Competencies Scoring */}
              <div className="glass-card rounded-xl p-4">
                <h4 className="font-semibold mb-4">Avaliação por Competência</h4>
                <div className="space-y-4">
                  {competencyLabels.map((label, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span className="font-medium">{scores[i]}</span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 40, 80, 120, 160, 200].map((value) => (
                          <button
                            key={value}
                            onClick={() => {
                              const newScores = [...scores];
                              newScores[i] = value;
                              setScores(newScores);
                            }}
                            className={`flex-1 h-8 rounded text-xs font-medium transition-colors ${
                              scores[i] === value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Nota Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {scores.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNavigation currentRoute="essays" />
    </div>
  );
}
