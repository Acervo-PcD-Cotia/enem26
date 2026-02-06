import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Flame, GraduationCap, Target, Calendar, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingData {
  targetCourse: string;
  targetUniversity: string;
  targetScore: number;
  currentLevel: "beginner" | "intermediate" | "advanced";
  availableDaysPerWeek: number;
  hoursPerDay: number;
  areaRatings: { [key: string]: number };
}

const steps = [
  { id: 1, title: "Seu Objetivo", icon: GraduationCap },
  { id: 2, title: "Meta de Nota", icon: Target },
  { id: 3, title: "Disponibilidade", icon: Calendar },
  { id: 4, title: "Autoavaliação", icon: BarChart3 },
  { id: 5, title: "Seu Plano", icon: Sparkles },
];

const disciplines = [
  { id: "MAT", name: "Matemática", color: "bg-primary" },
  { id: "NAT", name: "Ciências da Natureza", color: "bg-success" },
  { id: "HUM", name: "Ciências Humanas", color: "bg-energy" },
  { id: "LIN", name: "Linguagens", color: "bg-blue-500" },
  { id: "RED", name: "Redação", color: "bg-pink-500" },
];

const levelOptions = [
  { value: "beginner", label: "Iniciante", description: "Estou começando do zero ou quase" },
  { value: "intermediate", label: "Intermediário", description: "Já tenho uma base razoável" },
  { value: "advanced", label: "Avançado", description: "Domino boa parte do conteúdo" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    targetCourse: "",
    targetUniversity: "",
    targetScore: 700,
    currentLevel: "intermediate",
    availableDaysPerWeek: 5,
    hoursPerDay: 4,
    areaRatings: {
      MAT: 5,
      NAT: 5,
      HUM: 5,
      LIN: 5,
      RED: 5,
    },
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading, refreshProfile } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && profile?.onboarding_completed) {
      navigate("/dashboard");
    }
  }, [user, profile, loading, navigate]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          target_course: data.targetCourse,
          target_university: data.targetUniversity,
          target_score: data.targetScore,
          current_level: data.currentLevel,
          available_days_per_week: data.availableDaysPerWeek,
          hours_per_day: data.hoursPerDay,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Get discipline IDs
      const { data: disciplinesData, error: disciplinesError } = await supabase
        .from("disciplines")
        .select("id, code");

      if (disciplinesError) throw disciplinesError;

      // Insert area assessments
      const assessments = disciplinesData.map((d) => ({
        user_id: user.id,
        discipline_id: d.id,
        self_rating: data.areaRatings[d.code] || 5,
      }));

      const { error: assessmentError } = await supabase
        .from("user_area_assessment")
        .upsert(assessments, { onConflict: "user_id,discipline_id" });

      if (assessmentError) throw assessmentError;

      await refreshProfile();

      toast({
        title: "Plano criado com sucesso! 🎉",
        description: "Seu cronograma personalizado está pronto.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar suas informações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.targetCourse.trim().length > 0;
      case 2:
        return data.targetScore >= 400 && data.targetScore <= 1000;
      case 3:
        return data.availableDaysPerWeek > 0 && data.hoursPerDay > 0;
      case 4:
        return Object.keys(data.areaRatings).length === 5;
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <header className="p-4 border-b border-border/50">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-gradient-primary">ENEM+ 2026</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Passo {currentStep} de 5
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step.id <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto max-w-2xl p-4 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Step 1: Goal */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Qual é o seu objetivo?</h2>
                  <p className="text-muted-foreground mt-2">
                    Conte-nos sobre o curso e universidade que você deseja
                  </p>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="course">Curso desejado *</Label>
                    <Input
                      id="course"
                      placeholder="Ex: Medicina, Engenharia, Direito..."
                      value={data.targetCourse}
                      onChange={(e) => updateData({ targetCourse: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">Universidade alvo (opcional)</Label>
                    <Input
                      id="university"
                      placeholder="Ex: USP, UNICAMP, UFMG..."
                      value={data.targetUniversity}
                      onChange={(e) => updateData({ targetUniversity: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Target Score */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-4">
                    <Target className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="text-2xl font-bold">Qual sua meta de nota?</h2>
                  <p className="text-muted-foreground mt-2">
                    E como você avalia seu nível atual de conhecimento?
                  </p>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <Label>Nota alvo no ENEM: {data.targetScore}</Label>
                    <Slider
                      value={[data.targetScore]}
                      onValueChange={([value]) => updateData({ targetScore: value })}
                      min={400}
                      max={1000}
                      step={10}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>400</span>
                      <span>700</span>
                      <span>1000</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Seu nível atual</Label>
                    {levelOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ currentLevel: option.value as OnboardingData["currentLevel"] })}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          data.currentLevel === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-energy/10 mb-4">
                    <Calendar className="w-8 h-8 text-energy" />
                  </div>
                  <h2 className="text-2xl font-bold">Qual sua disponibilidade?</h2>
                  <p className="text-muted-foreground mt-2">
                    Vamos calcular quanto tempo você pode dedicar aos estudos
                  </p>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <Label>Dias por semana: {data.availableDaysPerWeek}</Label>
                    <Slider
                      value={[data.availableDaysPerWeek]}
                      onValueChange={([value]) => updateData({ availableDaysPerWeek: value })}
                      min={1}
                      max={7}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 dia</span>
                      <span>4 dias</span>
                      <span>7 dias</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Horas por dia: {data.hoursPerDay}</Label>
                    <Slider
                      value={[data.hoursPerDay]}
                      onValueChange={([value]) => updateData({ hoursPerDay: value })}
                      min={0.5}
                      max={10}
                      step={0.5}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>30 min</span>
                      <span>5h</span>
                      <span>10h</span>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4 bg-primary/5 border-primary/20">
                    <p className="text-sm text-center">
                      <span className="font-semibold text-primary">
                        {(data.availableDaysPerWeek * data.hoursPerDay).toFixed(1)}h
                      </span>{" "}
                      de estudo por semana
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Self Assessment */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-4">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Como você se avalia?</h2>
                  <p className="text-muted-foreground mt-2">
                    De 1 a 10, qual seu nível em cada área?
                  </p>
                </div>

                <div className="space-y-6 flex-1">
                  {disciplines.map((discipline) => (
                    <div key={discipline.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${discipline.color}`} />
                          {discipline.name}
                        </Label>
                        <span className="text-sm font-medium text-primary">
                          {data.areaRatings[discipline.id] || 5}
                        </span>
                      </div>
                      <Slider
                        value={[data.areaRatings[discipline.id] || 5]}
                        onValueChange={([value]) =>
                          updateData({
                            areaRatings: { ...data.areaRatings, [discipline.id]: value },
                          })
                        }
                        min={1}
                        max={10}
                        step={1}
                        className="py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Summary */}
            {currentStep === 5 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">Seu plano está pronto!</h2>
                  <p className="text-muted-foreground mt-2">
                    Confira o resumo e comece sua jornada
                  </p>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="glass-card rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Curso</span>
                      <span className="font-medium">{data.targetCourse}</span>
                    </div>
                    {data.targetUniversity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Universidade</span>
                        <span className="font-medium">{data.targetUniversity}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meta de nota</span>
                      <span className="font-medium text-primary">{data.targetScore} pontos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nível atual</span>
                      <span className="font-medium capitalize">{data.currentLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo semanal</span>
                      <span className="font-medium">
                        {(data.availableDaysPerWeek * data.hoursPerDay).toFixed(1)}h
                      </span>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">Suas áreas:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {disciplines.map((d) => (
                        <div key={d.id} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${d.color}`} />
                          <span className="text-sm">{d.name}</span>
                          <span className="text-sm text-muted-foreground ml-auto">
                            {data.areaRatings[d.id]}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4 bg-success/5 border-success/20">
                    <p className="text-sm text-center text-success">
                      ✨ Com base nas suas informações, criamos um plano de estudos personalizado com revisões automáticas RPA!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6 mt-auto">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-primary shadow-primary hover:opacity-90"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1 bg-gradient-primary shadow-primary hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Começar a estudar! 🚀
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
