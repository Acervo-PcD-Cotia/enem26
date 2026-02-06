import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  PenTool,
  Check,
  RotateCcw,
  Circle,
  Loader2,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { useRPAReviews } from "@/hooks/useRPAReviews";
import { SubjectMaterials } from "@/components/subjects/SubjectMaterials";
import { SubjectEssentialSummary } from "@/components/subjects/SubjectEssentialSummary";

interface Discipline {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string | null;
  display_order: number;
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  discipline_id: string;
}

interface SubjectProgress {
  subject_id: string;
  status: 'not_started' | 'studying' | 'reviewing' | 'consolidated';
}

const disciplineIcons: Record<string, React.ReactNode> = {
  MAT: <Calculator className="w-6 h-6" />,
  NAT: <FlaskConical className="w-6 h-6" />,
  HUM: <Globe className="w-6 h-6" />,
  LIN: <Languages className="w-6 h-6" />,
  RED: <PenTool className="w-6 h-6" />,
};

const statusConfig = {
  not_started: { icon: Circle, label: "Não iniciado", color: "text-muted-foreground" },
  studying: { icon: BookOpen, label: "Em estudo", color: "text-blue-500" },
  reviewing: { icon: RotateCcw, label: "Em revisão", color: "text-amber-500" },
  consolidated: { icon: Check, label: "Consolidado", color: "text-success" },
};

export default function Subjects() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { createInitialReviews } = useRPAReviews();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectForMaterials, setSelectedSubjectForMaterials] = useState<Subject | null>(null);
  const [selectedSubjectForSummary, setSelectedSubjectForSummary] = useState<Subject | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [disciplinesRes, subjectsRes, progressRes] = await Promise.all([
        supabase.from("disciplines").select("*").order("display_order"),
        supabase.from("subjects").select("*").order("display_order"),
        supabase.from("user_subject_progress").select("subject_id, status").eq("user_id", user?.id),
      ]);

      if (disciplinesRes.data) setDisciplines(disciplinesRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectStatus = (subjectId: string): 'not_started' | 'studying' | 'reviewing' | 'consolidated' => {
    const p = progress.find(p => p.subject_id === subjectId);
    return p?.status || 'not_started';
  };

  const getDisciplineProgress = (disciplineId: string) => {
    const disciplineSubjects = subjects.filter(s => s.discipline_id === disciplineId);
    if (disciplineSubjects.length === 0) return { completed: 0, total: 0, percent: 0 };
    
    const completed = disciplineSubjects.filter(s => {
      const status = getSubjectStatus(s.id);
      return status === 'consolidated' || status === 'reviewing';
    }).length;
    
    return {
      completed,
      total: disciplineSubjects.length,
      percent: Math.round((completed / disciplineSubjects.length) * 100),
    };
  };

  const updateSubjectStatus = async (subjectId: string, newStatus: 'not_started' | 'studying' | 'reviewing' | 'consolidated') => {
    if (!user) return;

    const existingProgress = progress.find(p => p.subject_id === subjectId);
    
    if (existingProgress) {
      await supabase
        .from("user_subject_progress")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'consolidated' ? new Date().toISOString() : null,
        })
        .eq("user_id", user.id)
        .eq("subject_id", subjectId);
    } else {
      await supabase
        .from("user_subject_progress")
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          status: newStatus,
          started_at: newStatus !== 'not_started' ? new Date().toISOString() : null,
        });
    }

    // Create RPA reviews when status becomes 'reviewing' or 'consolidated'
    if (newStatus === 'reviewing' || newStatus === 'consolidated') {
      await createInitialReviews(user.id, subjectId);
    }

    // Update local state
    setProgress(prev => {
      const existing = prev.find(p => p.subject_id === subjectId);
      if (existing) {
        return prev.map(p => p.subject_id === subjectId ? { ...p, status: newStatus } : p);
      }
      return [...prev, { subject_id: subjectId, status: newStatus }];
    });
  };

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
            {selectedDiscipline ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedDiscipline(null)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : null}
            <div>
              <h1 className="text-xl font-bold">
                {selectedDiscipline ? selectedDiscipline.name : "Trilhas de Estudo"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedDiscipline 
                  ? `${subjects.filter(s => s.discipline_id === selectedDiscipline.id).length} temas`
                  : "Organize seu aprendizado por área"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!selectedDiscipline ? (
            /* Disciplines Grid */
            <motion.div
              key="disciplines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {disciplines.map((discipline, index) => {
                const prog = getDisciplineProgress(discipline.id);
                return (
                  <motion.div
                    key={discipline.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedDiscipline(discipline)}
                    className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all"
                    style={{ borderLeft: `4px solid ${discipline.color}` }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${discipline.color}20` }}
                      >
                        <span style={{ color: discipline.color }}>
                          {disciplineIcons[discipline.code] || <BookOpen className="w-6 h-6" />}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-lg">{discipline.name}</h3>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span>{prog.total} temas</span>
                          <span>•</span>
                          <span>{prog.completed} concluídos</span>
                        </div>
                        
                        <Progress value={prog.percent} className="h-2" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* Subjects List */
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {subjects
                .filter(s => s.discipline_id === selectedDiscipline.id)
                .map((subject, index) => {
                  const status = getSubjectStatus(subject.id);
                  const StatusIcon = statusConfig[status].icon;
                  
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            const nextStatus: Record<string, 'not_started' | 'studying' | 'reviewing' | 'consolidated'> = {
                              not_started: 'studying',
                              studying: 'reviewing',
                              reviewing: 'consolidated',
                              consolidated: 'not_started',
                            };
                            updateSubjectStatus(subject.id, nextStatus[status]);
                          }}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            status === 'consolidated' 
                              ? 'bg-success border-success text-white' 
                              : status === 'reviewing'
                              ? 'bg-amber-500/10 border-amber-500'
                              : status === 'studying'
                              ? 'bg-blue-500/10 border-blue-500'
                              : 'border-muted-foreground/30'
                          }`}
                          data-tour="subject-status"
                        >
                          <StatusIcon className={`w-5 h-5 ${statusConfig[status].color}`} />
                        </button>
                        
                        <button 
                          className="flex-1 text-left"
                          onClick={() => setSelectedSubjectForSummary(subject)}
                        >
                          <p className={`font-medium ${status === 'consolidated' ? 'line-through text-muted-foreground' : ''}`}>
                            {subject.name}
                          </p>
                          {subject.description && (
                            <p className="text-sm text-muted-foreground">{subject.description}</p>
                          )}
                        </button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedSubjectForMaterials(subject)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <FolderOpen className="w-5 h-5" />
                        </Button>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'consolidated' 
                            ? 'bg-success/10 text-success' 
                            : status === 'reviewing'
                            ? 'bg-amber-500/10 text-amber-500'
                            : status === 'studying'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {statusConfig[status].label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNavigation currentRoute="subjects" />

      {/* Subject Materials Sheet */}
      {selectedSubjectForMaterials && (
        <SubjectMaterials
          open={!!selectedSubjectForMaterials}
          onOpenChange={(open) => !open && setSelectedSubjectForMaterials(null)}
          subjectId={selectedSubjectForMaterials.id}
          subjectName={selectedSubjectForMaterials.name}
        />
      )}

      {/* Subject Essential Summary */}
      {selectedSubjectForSummary && (
        <SubjectEssentialSummary
          open={!!selectedSubjectForSummary}
          onOpenChange={(open) => !open && setSelectedSubjectForSummary(null)}
          subjectId={selectedSubjectForSummary.id}
          subjectName={selectedSubjectForSummary.name}
        />
      )}
    </div>
  );
}
