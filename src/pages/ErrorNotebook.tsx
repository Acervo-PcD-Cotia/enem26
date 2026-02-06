import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookX,
  Brain,
  AlertTriangle,
  Clock,
  Eye,
  Loader2,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";

interface ErrorEntry {
  id: string;
  question_id: string;
  selected_option: number;
  is_correct: boolean;
  error_reason: 'content' | 'interpretation' | 'attention' | 'time' | null;
  created_at: string;
  time_spent_seconds: number | null;
  question: {
    question_text: string;
    correct_option: number;
    explanation: string | null;
    subject: {
      name: string;
      discipline: {
        name: string;
        color: string;
      };
    };
  };
}

const errorReasonConfig = {
  content: { label: "Conteúdo", icon: Brain, color: "text-blue-500", bg: "bg-blue-500/10" },
  interpretation: { label: "Interpretação", icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
  attention: { label: "Atenção", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  time: { label: "Tempo", icon: Clock, color: "text-red-500", bg: "bg-red-500/10" },
};

const errorReasonLabelsHuman: Record<string, string> = {
  content: "falta de conteúdo",
  interpretation: "interpretação errada",
  attention: "falta de atenção",
  time: "falta de tempo",
};

export default function ErrorNotebook() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterReason, setFilterReason] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchErrors();
    }
  }, [user]);

  const fetchErrors = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("question_responses")
      .select(`
        id, question_id, selected_option, is_correct, error_reason,
        created_at, time_spent_seconds,
        question:questions(
          question_text, correct_option, explanation,
          subject:subjects(name, discipline:disciplines(name, color))
        )
      `)
      .eq("user_id", user?.id)
      .eq("is_correct", false)
      .order("created_at", { ascending: false });

    if (data) {
      const transformed = data.map((e: any) => ({
        ...e,
        question: {
          question_text: e.question?.question_text || '',
          correct_option: e.question?.correct_option || 0,
          explanation: e.question?.explanation,
          subject: {
            name: e.question?.subject?.name || 'Assunto',
            discipline: {
              name: e.question?.subject?.discipline?.name || 'Disciplina',
              color: e.question?.subject?.discipline?.color || '#8B5CF6',
            },
          },
        },
      }));
      setErrors(transformed);
    }
    setIsLoading(false);
  };

  const updateErrorReason = async (errorId: string, reason: 'content' | 'interpretation' | 'attention' | 'time') => {
    await supabase
      .from("question_responses")
      .update({ error_reason: reason })
      .eq("id", errorId);
    
    setErrors(prev => prev.map(e => e.id === errorId ? { ...e, error_reason: reason } : e));
  };

  const stats = useMemo(() => ({
    total: errors.length,
    content: errors.filter(e => e.error_reason === 'content').length,
    interpretation: errors.filter(e => e.error_reason === 'interpretation').length,
    attention: errors.filter(e => e.error_reason === 'attention').length,
    time: errors.filter(e => e.error_reason === 'time').length,
    unclassified: errors.filter(e => !e.error_reason).length,
  }), [errors]);

  // Error profile: most common error type + most common discipline for that type
  const errorProfile = useMemo(() => {
    const classified = errors.filter(e => e.error_reason);
    if (classified.length < 3) return null;

    const reasonCounts: Record<string, number> = {};
    classified.forEach(e => {
      reasonCounts[e.error_reason!] = (reasonCounts[e.error_reason!] || 0) + 1;
    });

    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
    if (!topReason) return null;

    // Find top discipline for this error reason
    const errorsOfType = classified.filter(e => e.error_reason === topReason[0]);
    const disciplineCounts: Record<string, number> = {};
    errorsOfType.forEach(e => {
      const disc = e.question.subject.discipline.name;
      disciplineCounts[disc] = (disciplineCounts[disc] || 0) + 1;
    });

    const topDiscipline = Object.entries(disciplineCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      reason: topReason[0],
      reasonLabel: errorReasonLabelsHuman[topReason[0]] || topReason[0],
      discipline: topDiscipline?.[0] || null,
    };
  }, [errors]);

  const filteredErrors = filterReason 
    ? errors.filter(e => e.error_reason === filterReason)
    : errors;

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <BookX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Caderno de Erros</h1>
              <p className="text-sm text-muted-foreground">
                Por que você errou? Entender isso muda tudo.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Error Profile */}
        {errorProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-destructive/5 border-l-4 border-primary"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Seu perfil de erro</p>
                <p className="text-sm text-muted-foreground">
                  Você erra mais por <span className="font-semibold text-foreground">{errorProfile.reasonLabel}</span>
                  {errorProfile.discipline && (
                    <> em <span className="font-semibold text-foreground">{errorProfile.discipline}</span></>
                  )}
                  . Saber disso já é metade da solução.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(errorReasonConfig) as Array<keyof typeof errorReasonConfig>).map((key) => {
            const config = errorReasonConfig[key];
            const count = stats[key];
            return (
              <button
                key={key}
                onClick={() => setFilterReason(filterReason === key ? null : key)}
                className={`glass-card rounded-xl p-3 text-center transition-all ${
                  filterReason === key ? 'ring-2 ring-primary' : ''
                }`}
              >
                <config.icon className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </button>
            );
          })}
        </div>

        {/* Classify CTA */}
        {stats.unclassified > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 bg-primary/5 border-l-4 border-primary"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Por que você errou? Entender isso muda tudo.</p>
                <p className="text-sm text-muted-foreground">
                  {stats.unclassified} erros aguardando classificação.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pattern Analysis with discipline grouping */}
        {stats.total > 5 && (
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Análise de Padrões</h3>
            </div>
            
            <div className="space-y-2">
              {Object.entries(errorReasonConfig).map(([key, config]) => {
                const count = stats[key as keyof typeof stats] as number;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                
                // Group by discipline for this error type
                const errorsOfType = errors.filter(e => e.error_reason === key);
                const topDisciplines: Record<string, number> = {};
                errorsOfType.forEach(e => {
                  const d = e.question.subject.discipline.name;
                  topDisciplines[d] = (topDisciplines[d] || 0) + 1;
                });
                const topDisc = Object.entries(topDisciplines).sort((a, b) => b[1] - a[1])[0];

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {config.label}
                          {topDisc && count > 0 && (
                            <span className="text-muted-foreground text-xs ml-1">
                              (mais em {topDisc[0]})
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">{percent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={`h-full rounded-full ${config.bg.replace('/10', '')}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {filterReason ? `Erros por ${errorReasonConfig[filterReason as keyof typeof errorReasonConfig]?.label}` : "Todos os Erros"}
            </h3>
            {filterReason && (
              <Button variant="ghost" size="sm" onClick={() => setFilterReason(null)}>
                Limpar filtro
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filteredErrors.map((error) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${error.question.subject.discipline.color}20` }}
                  >
                    <BookX className="w-5 h-5" style={{ color: error.question.subject.discipline.color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{error.question.question_text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{error.question.subject.name}</span>
                      <span>•</span>
                      <span>{error.question.subject.discipline.name}</span>
                      <span>•</span>
                      <span>{new Date(error.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>

                {/* Error Classification */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Por que você errou?</p>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.entries(errorReasonConfig) as [keyof typeof errorReasonConfig, typeof errorReasonConfig[keyof typeof errorReasonConfig]][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateErrorReason(error.id, key)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                          error.error_reason === key
                            ? `${config.bg} ${config.color} font-medium`
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                {error.question.explanation && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Explicação:</span> {error.question.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredErrors.length === 0 && (
              <div className="text-center py-12">
                <BookX className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {filterReason ? "Nenhum erro nesta categoria" : "Nenhum erro registrado ainda!"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue praticando questões.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation currentRoute="errors" />
    </div>
  );
}
