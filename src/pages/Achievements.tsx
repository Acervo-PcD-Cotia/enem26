import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GamificationWidget } from "@/components/gamification/GamificationWidget";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";

export default function Achievements() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  if (loading || !profile) {
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
          <h1 className="text-xl font-bold">Conquistas & Gamificação</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seu progresso</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <GamificationWidget />
      </main>

      <BottomNavigation currentRoute="achievements" />
    </div>
  );
}
