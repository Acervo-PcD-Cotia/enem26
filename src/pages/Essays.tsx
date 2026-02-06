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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { EssayGuidedFlow } from "@/components/essays/EssayGuidedFlow";

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
  const [newTheme, setNewTheme] = useState("");

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
    setShowEditor(true);
    setNewTheme("");
    fetchEssays();
  };

  const handleGuidedComplete = async (guidedData: any, content: string) => {
    if (!currentEssay) return;

    const { error } = await supabase
      .from("essays")
      .update({
        content,
        submitted_at: new Date().toISOString(),
        thesis: guidedData.thesis,
        argument_1: guidedData.argument_1,
        argument_2: guidedData.argument_2,
        intervention_agent: guidedData.intervention_agent,
        intervention_action: guidedData.intervention_action,
        intervention_means: guidedData.intervention_means,
        intervention_detail: guidedData.intervention_detail,
        intervention_purpose: guidedData.intervention_purpose,
      } as any)
      .eq("id", currentEssay.id);

    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
      return;
    }

    toast({ title: "Redação salva!", description: "Sua redação foi enviada com sucesso." });
    setShowEditor(false);
    setCurrentEssay(null);
    fetchEssays();
  };

  const openEssay = (essay: Essay) => {
    setCurrentEssay(essay);
    setShowEditor(true);
  };

  const averageScore = essays.length > 0 
    ? Math.round(essays.filter(e => e.total_score).reduce((a, e) => a + (e.total_score || 0), 0) / (essays.filter(e => e.total_score).length || 1)) 
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
                  {showEditor ? "Redação Guiada" : "Redação ENEM"}
                </h1>
                {!showEditor && (
                  <p className="text-sm text-muted-foreground">
                    {essays.length} redações escritas
                  </p>
                )}
              </div>
            </div>
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
                <h3 className="font-semibold mb-2">Nova Redação</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você vai escrever em etapas: tese, argumentos, intervenção e depois o texto completo.
                </p>
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
                            {essay.submitted_at && !essay.total_score && (
                              <>
                                <span>•</span>
                                <span className="text-primary text-xs">Enviada</span>
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
            >
              {currentEssay && (
                <EssayGuidedFlow
                  theme={currentEssay.theme}
                  onComplete={handleGuidedComplete}
                  initialContent={currentEssay.content || ""}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNavigation currentRoute="essays" />
    </div>
  );
}
