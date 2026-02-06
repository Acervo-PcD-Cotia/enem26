import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTour() {
  const { user, profile } = useAuth();
  const [tourCompleted, setTourCompleted] = useState(true);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (profile) {
      // Check if tour_completed exists in profile (may be undefined initially)
      const completed = (profile as any).tour_completed ?? false;
      setTourCompleted(completed);
      
      // Show tour only if not completed and onboarding is done
      if (!completed && profile.onboarding_completed) {
        setShowTour(true);
      }
    }
  }, [profile]);

  const completeTour = async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ tour_completed: true } as any)
        .eq("user_id", user.id);

      setTourCompleted(true);
      setShowTour(false);
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  };

  const startTour = () => {
    setShowTour(true);
  };

  const dismissTour = () => {
    setShowTour(false);
  };

  return {
    tourCompleted,
    showTour,
    completeTour,
    startTour,
    dismissTour,
  };
}
