import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { useRPAReviews } from "@/hooks/useRPAReviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  id: string;
  subject_id: string;
  interval: string;
  scheduled_date: string;
  status: string;
  review_type: string | null;
  subject: {
    name: string;
    discipline: {
      name: string;
      color: string;
    };
  };
}

const intervalLabels: Record<string, string> = {
  '24h': '24 horas',
  '7d': '7 dias',
  '15d': '15 dias',
  '30d': '30 dias',
  '60d': '60 dias',
  '120d': '120 dias',
  '180d': '180 dias',
};

export default function Reviews() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { completeReview, postponeReview } = useRPAReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("rpa_reviews")
        .select(`
          id,
          subject_id,
          interval,
          scheduled_date,
          status,
          review_type,
          subject:subjects(
            name,
            discipline:disciplines(name, color)
          )
        `)
        .eq("user_id", user?.id)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      
      // Transform data to match expected structure
      const transformedData = (data || []).map((review: any) => ({
        ...review,
        subject: {
          name: review.subject?.name || 'Assunto desconhecido',
          discipline: {
            name: review.subject?.discipline?.name || 'Disciplina',
            color: review.subject?.discipline?.color || '#8B5CF6',
          },
        },
      }));
      
      setReviews(transformedData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (reviewId: string) => {
    await completeReview(reviewId);
    fetchReviews();
  };

  const handlePostpone = async (reviewId: string) => {
    await postponeReview(reviewId);
    fetchReviews();
  };

  const today = new Date().toISOString().split('T')[0];
  
  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const overdueReviews = pendingReviews.filter(r => r.scheduled_date < today);
  const todayReviews = pendingReviews.filter(r => r.scheduled_date === today);
  const upcomingReviews = pendingReviews.filter(r => r.scheduled_date > today);
  const completedReviews = reviews.filter(r => r.status === 'completed');

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const ReviewCard = ({ review, showActions = true }: { review: Review; showActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${review.subject.discipline.color}20` }}
        >
          <Brain className="w-6 h-6" style={{ color: review.subject.discipline.color }} />
        </div>

        <div className="flex-1">
          <p className="font-medium">{review.subject.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{review.subject.discipline.name}</span>
            <span>•</span>
            <Badge variant="outline" className="text-xs">
              {intervalLabels[review.interval] || review.interval}
            </Badge>
          </div>
        </div>

        {showActions && review.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePostpone(review.id)}
              className="text-muted-foreground"
            >
              <Clock className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleComplete(review.id)}
              className="bg-success hover:bg-success/90"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )}

        {review.status === 'completed' && (
          <Check className="w-5 h-5 text-success" />
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-success" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Revisões RPA</h1>
              <p className="text-sm text-muted-foreground">
                {pendingReviews.length} revisões pendentes
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overdue Alert */}
        {overdueReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 border-l-4 border-destructive bg-destructive/5"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  {overdueReviews.length} revisões atrasadas
                </p>
                <p className="text-sm text-muted-foreground">
                  Complete-as para não perder o progresso!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending">
              Pendentes ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Próximas ({upcomingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({completedReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {/* Today's Reviews */}
            {todayReviews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Hoje</h3>
                </div>
                <div className="space-y-3">
                  {todayReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            )}

            {/* Overdue Reviews */}
            {overdueReviews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <h3 className="font-semibold text-destructive">Atrasadas</h3>
                </div>
                <div className="space-y-3">
                  {overdueReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            )}

            {pendingReviews.length === 0 && (
              <div className="text-center py-12">
                <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma revisão pendente!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue estudando novos conteúdos.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcomingReviews.map((review) => (
              <ReviewCard key={review.id} review={review} showActions={false} />
            ))}
            {upcomingReviews.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma revisão agendada.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedReviews.slice(0, 20).map((review) => (
              <ReviewCard key={review.id} review={review} showActions={false} />
            ))}
            {completedReviews.length === 0 && (
              <div className="text-center py-12">
                <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma revisão concluída ainda.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation currentRoute="reviews" />
    </div>
  );
}
