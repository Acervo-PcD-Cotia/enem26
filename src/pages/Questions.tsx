import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Clock,
  Check,
  X,
  ChevronRight,
  Loader2,
  BarChart3,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string | null;
  difficulty: number | null;
  subject: {
    name: string;
    discipline: {
      name: string;
      color: string;
    };
  };
}

interface Discipline {
  id: string;
  name: string;
  code: string;
  color: string;
}

type QuestionMode = "select" | "practice" | "result";

export default function Questions() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [mode, setMode] = useState<QuestionMode>("select");
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStats, setQuestionStats] = useState({ total: 0, correct: 0, avgTime: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDisciplines();
      fetchStats();
    }
  }, [user]);

  const fetchDisciplines = async () => {
    const { data } = await supabase
      .from("disciplines")
      .select("*")
      .order("display_order");
    if (data) setDisciplines(data);
    setIsLoading(false);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from("question_responses")
      .select("is_correct, time_spent_seconds")
      .eq("user_id", user?.id);
    
    if (data) {
      const total = data.length;
      const correct = data.filter(r => r.is_correct).length;
      const totalTime = data.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
      setQuestionStats({
        total,
        correct,
        avgTime: total > 0 ? Math.round(totalTime / total) : 0,
      });
    }
  };

  const startPractice = async (discipline: Discipline) => {
    setSelectedDiscipline(discipline);
    setIsLoading(true);
    
    // Fetch questions for this discipline
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("id")
      .eq("discipline_id", discipline.id);
    
    const subjectIds = subjectsData?.map(s => s.id) || [];
    
    if (subjectIds.length === 0) {
      toast({
        title: "Sem questões disponíveis",
        description: "Ainda não há questões cadastradas para esta disciplina.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { data: questionsData } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        options,
        correct_option,
        explanation,
        difficulty,
        subject:subjects(
          name,
          discipline:disciplines(name, color)
        )
      `)
      .in("subject_id", subjectIds)
      .limit(10);

    if (!questionsData || questionsData.length === 0) {
      toast({
        title: "Sem questões disponíveis",
        description: "Ainda não há questões cadastradas para esta disciplina.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Transform data
    const transformed = questionsData.map((q: any) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      subject: {
        name: q.subject?.name || 'Assunto',
        discipline: {
          name: q.subject?.discipline?.name || discipline.name,
          color: q.subject?.discipline?.color || discipline.color,
        },
      },
    }));

    setQuestions(transformed);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setMode("practice");
    setStartTime(Date.now());
    setIsLoading(false);
  };

  const handleAnswer = async (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correct_option;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    // Save response
    await supabase.from("question_responses").insert({
      user_id: user?.id,
      question_id: currentQuestion.id,
      selected_option: optionIndex,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    } else {
      setMode("result");
    }
  };

  const resetPractice = () => {
    setMode("select");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setSelectedDiscipline(null);
    fetchStats();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-energy/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-energy" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {mode === "select" ? "Banco de Questões" : selectedDiscipline?.name}
              </h1>
              {mode === "practice" && (
                <p className="text-sm text-muted-foreground">
                  Questão {currentQuestionIndex + 1} de {questions.length}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {mode === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card rounded-xl p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-lg font-bold">{questionStats.total}</p>
                  <p className="text-xs text-muted-foreground">Resolvidas</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <Check className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-lg font-bold">
                    {questionStats.total > 0 
                      ? Math.round((questionStats.correct / questionStats.total) * 100) 
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-energy mx-auto mb-2" />
                  <p className="text-lg font-bold">{questionStats.avgTime}s</p>
                  <p className="text-xs text-muted-foreground">Média</p>
                </div>
              </div>

              {/* Discipline Selection */}
              <section>
                <h2 className="font-semibold mb-4">Escolha uma disciplina</h2>
                <div className="grid gap-3">
                  {disciplines.map((discipline) => (
                    <motion.div
                      key={discipline.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startPractice(discipline)}
                      className="glass-card rounded-xl p-4 cursor-pointer"
                      style={{ borderLeft: `4px solid ${discipline.color}` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${discipline.color}20` }}
                          >
                            <BookOpen className="w-5 h-5" style={{ color: discipline.color }} />
                          </div>
                          <span className="font-medium">{discipline.name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {mode === "practice" && currentQuestion && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress */}
              <Progress value={progressPercent} className="h-2" />

              {/* Question */}
              <div className="glass-card rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  {currentQuestion.subject.name}
                </p>
                <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correct_option;
                  const showResult = selectedAnswer !== null;

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        showResult
                          ? isCorrect
                            ? "border-success bg-success/10"
                            : isSelected
                            ? "border-destructive bg-destructive/10"
                            : "border-muted"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && isCorrect && (
                          <Check className="w-5 h-5 text-success" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-card rounded-xl p-4 bg-primary/5"
                  >
                    <p className="font-medium mb-2">Explicação:</p>
                    <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {selectedAnswer !== null && (
                <Button onClick={nextQuestion} className="w-full" size="lg">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Próxima <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Ver resultado"
                  )}
                </Button>
              )}
            </motion.div>
          )}

          {mode === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="glass-card rounded-2xl p-8">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{
                    backgroundColor:
                      correctAnswers / questions.length >= 0.7
                        ? "rgb(16 185 129 / 0.2)"
                        : "rgb(249 115 22 / 0.2)",
                  }}
                >
                  <span className="text-4xl font-bold">
                    {Math.round((correctAnswers / questions.length) * 100)}%
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  {correctAnswers / questions.length >= 0.7
                    ? "Parabéns! 🎉"
                    : "Continue praticando! 💪"}
                </h2>

                <p className="text-muted-foreground">
                  Você acertou {correctAnswers} de {questions.length} questões
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetPractice} className="flex-1">
                  Escolher outra
                </Button>
                <Button
                  onClick={() => startPractice(selectedDiscipline!)}
                  className="flex-1"
                >
                  Praticar novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNavigation currentRoute="questions" />
    </div>
  );
}
