import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Clock, Sparkles, AlertTriangle, Target, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SubjectEssentialSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  subjectName: string;
}

interface SummarySection {
  title: string;
  icon: any;
  items: string[];
}

export function SubjectEssentialSummary({ open, onOpenChange, subjectId, subjectName }: SubjectEssentialSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<SummarySection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && subjectId) {
      fetchOrGenerateSummary();
    }
  }, [open, subjectId]);

  const fetchOrGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const { data: cached } = await supabase
        .from("subject_summaries")
        .select("content")
        .eq("subject_id", subjectId)
        .maybeSingle();

      if (cached?.content) {
        parseSummary(cached.content);
        setIsLoading(false);
        return;
      }

      // Generate via edge function
      const { data, error: fnError } = await supabase.functions.invoke("generate-summary", {
        body: { subjectId, subjectName },
      });

      if (fnError) throw fnError;
      if (data?.content) {
        parseSummary(data.content);
      } else {
        setError("Não foi possível gerar o resumo.");
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Erro ao carregar o resumo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseSummary = (content: string) => {
    // Try to parse as JSON sections
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        setSections(parsed.map((s: any) => ({
          title: s.title || "Tópico",
          icon: getIconForSection(s.title || ""),
          items: Array.isArray(s.items) ? s.items : [s.content || ""],
        })));
        return;
      }
    } catch {}

    // Fallback: treat as plain text with sections
    const lines = content.split("\n").filter(l => l.trim());
    setSections([{
      title: "Resumo Essencial",
      icon: Sparkles,
      items: lines,
    }]);
  };

  const getIconForSection = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("cai") || lower.includes("frequen")) return Target;
    if (lower.includes("erro")) return AlertTriangle;
    if (lower.includes("armadilha") || lower.includes("pegadinha")) return AlertTriangle;
    if (lower.includes("dica") || lower.includes("macete")) return Lightbulb;
    return Sparkles;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left">{subjectName}</SheetTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>~5 min de leitura</span>
          </div>
        </SheetHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Gerando resumo essencial...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!isLoading && !error && sections.length > 0 && (
          <div className="space-y-5 pb-6">
            {sections.map((section, i) => {
              const SectionIcon = section.icon;
              return (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <SectionIcon className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
