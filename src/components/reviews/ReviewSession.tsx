import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Check, X, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string | null;
}

interface ReviewSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  subjectId: string;
  subjectName: string;
  onComplete: () => void;
}

export function ReviewSession({ open, onOpenChange, reviewId, subjectId, subjectName, onComplete }: ReviewSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSessionData();
    }
  }, [open, subjectId]);

  const fetchSessionData = async () => {
    setIsLoading(true);
    setCurrentQ(0);
    setAnswers({});
    setShowResult(null);
    setAllDone(false);

    // Fetch 3 random questions for this subject
    const { data: questionsData } = await supabase
      .from("questions")
      .select("id, question_text, options, correct_option, explanation")
      .eq("subject_id", subjectId)
      .limit(3);

    if (questionsData && questionsData.length > 0) {
      setQuestions(questionsData.map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })));
    } else {
      setQuestions([]);
    }

    // Fetch cached summary
    const { data: summaryData } = await supabase
      .from("subject_summaries")
      .select("content")
      .eq("subject_id", subjectId)
      .maybeSingle();

    if (summaryData?.content) {
      try {
        const parsed = JSON.parse(summaryData.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Get the tip/dica section
          const tipSection = parsed.find((s: any) => 
            s.title?.toLowerCase().includes("dica") || s.title?.toLowerCase().includes("macete")
          );
          setSummary(tipSection ? tipSection.items?.[0] : parsed[0]?.items?.[0] || null);
        }
      } catch {
        setSummary(summaryData.content.split("\n")[0] || null);
      }
    }

    setIsLoading(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (showResult !== null) return;
    setAnswers({ ...answers, [currentQ]: optionIndex });
    setShowResult(optionIndex);
  };

  const handleNext = () => {
    setShowResult(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setAllDone(true);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const noQuestions = !isLoading && questions.length === 0;
  const correctCount = Object.entries(answers).filter(
    ([qi, a]) => questions[Number(qi)]?.correct_option === a
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left">Revisão: {subjectName}</SheetTitle>
          <p className="text-sm text-muted-foreground text-left">
            Você estudou isso há alguns dias. Vamos garantir que não esqueceu.
          </p>
        </SheetHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparando revisão...</p>
          </div>
        )}

        {noQuestions && (
          <div className="space-y-4 pb-6">
            {summary && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-sm">Dica prática</h3>
                </div>
                <p className="text-sm text-muted-foreground">{summary}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Ainda não há questões cadastradas para este assunto.
            </p>
            <Button onClick={handleComplete} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Concluir revisão
            </Button>
          </div>
        )}

        {!isLoading && questions.length > 0 && !allDone && (
          <div className="space-y-4 pb-6">
            {/* Progress */}
            <div className="flex items-center gap-1">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentQ ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Questão {currentQ + 1} de {questions.length}
            </p>

            {/* Question */}
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-xl p-4"
            >
              <p className="text-sm font-medium mb-4">{questions[currentQ].question_text}</p>
              <div className="space-y-2">
                {questions[currentQ].options.map((opt, i) => {
                  const isCorrect = questions[currentQ].correct_option === i;
                  const isSelected = showResult === i;
                  const showFeedback = showResult !== null;

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showResult !== null}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                        showFeedback && isCorrect
                          ? 'border-success bg-success/10 text-success'
                          : showFeedback && isSelected && !isCorrect
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium w-6">{String.fromCharCode(65 + i)})</span>
                        <span>{opt}</span>
                        {showFeedback && isCorrect && <Check className="w-4 h-4 ml-auto text-success" />}
                        {showFeedback && isSelected && !isCorrect && <X className="w-4 h-4 ml-auto text-destructive" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult !== null && questions[currentQ].explanation && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Explicação:</span> {questions[currentQ].explanation}
                  </p>
                </div>
              )}
            </motion.div>

            {showResult !== null && (
              <Button onClick={handleNext} className="w-full">
                {currentQ < questions.length - 1 ? "Próxima questão" : "Ver resultado"}
              </Button>
            )}
          </div>
        )}

        {allDone && (
          <div className="space-y-4 pb-6">
            <div className="text-center py-6">
              <Brain className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-xl font-bold">{correctCount}/{questions.length} acertos</p>
              <p className="text-sm text-muted-foreground mt-1">
                {correctCount === questions.length
                  ? "Perfeito! Esse conteúdo está consolidado."
                  : correctCount >= questions.length / 2
                  ? "Bom! Mas vale rever alguns pontos."
                  : "Atenção! Esse conteúdo precisa de mais prática."}
              </p>
            </div>

            {summary && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-sm">Dica prática</h3>
                </div>
                <p className="text-sm text-muted-foreground">{summary}</p>
              </div>
            )}

            <Button onClick={handleComplete} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Concluir revisão
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
