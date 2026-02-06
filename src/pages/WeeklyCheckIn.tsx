import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Moon,
  Zap,
  Target,
  Heart,
  Clock,
  Sparkles,
  ChevronLeft,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CheckInData {
  sleep_rating: number;
  focus_rating: number;
  energy_rating: number;
  motivation_rating: number;
  discipline_rating: number;
  consistency_rating: number;
}

const indicators = [
  {
    key: "sleep_rating",
    label: "Sono",
    icon: Moon,
    color: "#6366F1",
    description: "Qualidade do sono esta semana",
  },
  {
    key: "focus_rating",
    label: "Foco",
    icon: Target,
    color: "#F59E0B",
    description: "Capacidade de concentração",
  },
  {
    key: "energy_rating",
    label: "Energia",
    icon: Zap,
    color: "#10B981",
    description: "Nível de energia para estudar",
  },
  {
    key: "motivation_rating",
    label: "Motivação",
    icon: Heart,
    color: "#EF4444",
    description: "Vontade de estudar",
  },
  {
    key: "discipline_rating",
    label: "Disciplina",
    icon: Clock,
    color: "#8B5CF6",
    description: "Consistência nos horários",
  },
  {
    key: "consistency_rating",
    label: "Consistência",
    icon: Brain,
    color: "#EC4899",
    description: "Regularidade nos estudos",
  },
];

export default function WeeklyCheckIn() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState("");
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);

  const [ratings, setRatings] = useState<CheckInData>({
    sleep_rating: 5,
    focus_rating: 5,
    energy_rating: 5,
    motivation_rating: 5,
    discipline_rating: 5,
    consistency_rating: 5,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkExistingCheckIn();
    }
  }, [user]);

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const checkExistingCheckIn = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const weekStart = getWeekStart();
      const { data } = await supabase
        .from("weekly_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .single();

      if (data) {
        setExistingCheckIn(data);
        setRatings({
          sleep_rating: data.sleep_rating || 5,
          focus_rating: data.focus_rating || 5,
          energy_rating: data.energy_rating || 5,
          motivation_rating: data.motivation_rating || 5,
          discipline_rating: data.discipline_rating || 5,
          consistency_rating: data.consistency_rating || 5,
        });
        if (data.ai_recommendations) {
          setAiRecommendations(data.ai_recommendations);
          setShowResults(true);
        }
      }
    } catch (error) {
      // No existing check-in, that's fine
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIRecommendations = async () => {
    // Simple rule-based recommendations (can be enhanced with AI later)
    const recommendations: string[] = [];
    const average =
      Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

    if (ratings.sleep_rating < 5) {
      recommendations.push(
        "💤 Priorize o sono! Tente dormir 7-8 horas por noite. Evite telas 1 hora antes de dormir."
      );
    }
    if (ratings.focus_rating < 5) {
      recommendations.push(
        "🎯 Para melhorar o foco, experimente sessões de estudo mais curtas (25 min) com pausas regulares."
      );
    }
    if (ratings.energy_rating < 5) {
      recommendations.push(
        "⚡ Cuide da sua alimentação e faça pequenas pausas para movimentar o corpo durante os estudos."
      );
    }
    if (ratings.motivation_rating < 5) {
      recommendations.push(
        "❤️ Relembre seus objetivos! Visualize-se aprovado na faculdade dos seus sonhos."
      );
    }
    if (ratings.discipline_rating < 5) {
      recommendations.push(
        "⏰ Estabeleça horários fixos de estudo. A consistência é mais importante que a intensidade."
      );
    }
    if (ratings.consistency_rating < 5) {
      recommendations.push(
        "📚 Tente estudar um pouco todos os dias, mesmo que seja por 30 minutos."
      );
    }

    if (average >= 7) {
      recommendations.push(
        "🌟 Excelente semana! Mantenha esse ritmo e você vai longe. Continue assim!"
      );
    } else if (average >= 5) {
      recommendations.push(
        "👍 Semana razoável! Identifique 1 área para melhorar esta semana e foque nela."
      );
    } else {
      recommendations.push(
        "💪 Semana difícil, mas não desanime! Pequenas melhorias consistentes fazem grande diferença."
      );
    }

    return recommendations.join("\n\n");
  };

  const handleNext = () => {
    if (currentStep < indicators.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const recommendations = await generateAIRecommendations();
      setAiRecommendations(recommendations);

      const weekStart = getWeekStart();

      if (existingCheckIn) {
        await supabase
          .from("weekly_checkins")
          .update({
            ...ratings,
            ai_recommendations: recommendations,
          })
          .eq("id", existingCheckIn.id);
      } else {
        await supabase.from("weekly_checkins").insert({
          user_id: user.id,
          week_start: weekStart,
          ...ratings,
          ai_recommendations: recommendations,
        });
      }

      toast({
        title: "Check-in salvo!",
        description: "Suas avaliações foram registradas.",
      });

      setShowResults(true);
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast({
        title: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentIndicator = indicators[currentStep];
  const CurrentIcon = currentIndicator?.icon;

  if (showResults) {
    const average =
      Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Resultado do Check-in</h1>
                <p className="text-sm text-muted-foreground">Roda da Aprovação</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Approval Wheel Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-center mb-6">Sua Roda da Aprovação</h2>

            <div className="relative w-64 h-64 mx-auto">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full border-4 border-border" />

              {/* Indicator segments */}
              {indicators.map((indicator, index) => {
                const angle = (index * 360) / indicators.length - 90;
                const rating = ratings[indicator.key as keyof CheckInData];
                const radius = 80 * (rating / 10);

                return (
                  <motion.div
                    key={indicator.key}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: indicator.color,
                      left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * radius}px - 6px)`,
                      top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * radius}px - 6px)`,
                      boxShadow: `0 0 10px ${indicator.color}`,
                    }}
                  />
                );
              })}

              {/* Center score */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold">{average.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Média</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {indicators.map((indicator) => {
                const Icon = indicator.icon;
                const rating = ratings[indicator.key as keyof CheckInData];
                return (
                  <div key={indicator.key} className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4" style={{ color: indicator.color }} />
                    <span>{indicator.label}: {rating}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Recomendações para Você</h2>
            </div>

            <div className="space-y-4 text-sm">
              {aiRecommendations.split("\n\n").map((rec, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="leading-relaxed"
                >
                  {rec}
                </motion.p>
              ))}
            </div>
          </motion.div>

          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Voltar ao Dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Check-in Semanal</h1>
              <p className="text-sm text-muted-foreground">
                {currentStep + 1} de {indicators.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-2xl p-6 space-y-8"
        >
          {/* Indicator Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${currentIndicator.color}20` }}
            >
              <CurrentIcon
                className="w-10 h-10"
                style={{ color: currentIndicator.color }}
              />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">{currentIndicator.label}</h2>
            <p className="text-muted-foreground">{currentIndicator.description}</p>
          </div>

          {/* Rating Slider */}
          <div className="space-y-6">
            <div className="text-center">
              <span
                className="text-6xl font-bold"
                style={{ color: currentIndicator.color }}
              >
                {ratings[currentIndicator.key as keyof CheckInData]}
              </span>
              <span className="text-2xl text-muted-foreground">/10</span>
            </div>

            <Slider
              value={[ratings[currentIndicator.key as keyof CheckInData]]}
              onValueChange={([value]) =>
                setRatings((prev) => ({
                  ...prev,
                  [currentIndicator.key]: value,
                }))
              }
              max={10}
              min={1}
              step={1}
              className="py-4"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Péssimo</span>
              <span>Regular</span>
              <span>Excelente</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Anterior
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : currentStep === indicators.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Concluir
                </>
              ) : (
                "Próximo"
              )}
            </Button>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {indicators.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
