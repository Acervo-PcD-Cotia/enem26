import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RPA_INTERVALS: ('24h' | '7d' | '15d' | '30d' | '60d' | '120d' | '180d')[] = [
  '24h', '7d', '15d', '30d', '60d', '120d', '180d'
];

const getNextReviewDate = (interval: string): Date => {
  const now = new Date();
  switch (interval) {
    case '24h': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '15d': return new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case '60d': return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    case '120d': return new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);
    case '180d': return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
};

export function useRPAReviews() {
  const { toast } = useToast();

  const createInitialReviews = async (userId: string, subjectId: string) => {
    try {
      console.log("[RPA] Creating reviews for:", { userId, subjectId });

      // Check if reviews already exist for this subject
      const { data: existingReviews, error: checkError } = await supabase
        .from("rpa_reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("subject_id", subjectId)
        .limit(1);

      if (checkError) {
        console.error("[RPA] Error checking existing reviews:", checkError);
        throw checkError;
      }

      if (existingReviews && existingReviews.length > 0) {
        console.log("[RPA] Reviews already exist for this subject, skipping");
        return;
      }

      // Create all review intervals for this subject
      const reviews = RPA_INTERVALS.map(interval => ({
        user_id: userId,
        subject_id: subjectId,
        interval: interval,
        scheduled_date: getNextReviewDate(interval).toISOString().split('T')[0],
        status: 'pending' as const,
        review_type: interval === '24h' ? 'flashcard' : 'questions',
      }));

      console.log("[RPA] Inserting reviews:", reviews);

      const { data: insertedData, error } = await supabase
        .from("rpa_reviews")
        .insert(reviews)
        .select();
      
      if (error) {
        console.error("[RPA] Insert error:", error);
        throw error;
      }

      console.log("[RPA] Reviews created successfully:", insertedData);

      toast({
        title: "Revisões agendadas!",
        description: "7 revisões RPA foram criadas automaticamente para este assunto.",
      });
    } catch (error) {
      console.error("[RPA] Error creating RPA reviews:", error);
      toast({
        title: "Erro ao criar revisões",
        description: "Não foi possível agendar as revisões automáticas.",
        variant: "destructive",
      });
    }
  };

  const completeReview = async (reviewId: string, score?: number) => {
    try {
      const { error } = await supabase
        .from("rpa_reviews")
        .update({
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          score: score,
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Revisão concluída!",
        description: "Continue assim para consolidar o conhecimento.",
      });
    } catch (error) {
      console.error("Error completing review:", error);
      toast({
        title: "Erro ao concluir revisão",
        variant: "destructive",
      });
    }
  };

  const postponeReview = async (reviewId: string) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { error } = await supabase
        .from("rpa_reviews")
        .update({
          status: 'postponed',
          scheduled_date: tomorrow.toISOString().split('T')[0],
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Revisão adiada",
        description: "A revisão foi reagendada para amanhã.",
      });
    } catch (error) {
      console.error("Error postponing review:", error);
    }
  };

  return {
    createInitialReviews,
    completeReview,
    postponeReview,
    RPA_INTERVALS,
  };
}
