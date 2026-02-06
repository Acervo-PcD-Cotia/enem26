import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Video,
  Brain,
  Layers,
  Presentation,
  Plus,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MaterialCard } from "./MaterialCard";
import { MaterialUploadDialog } from "./MaterialUploadDialog";

interface SubjectMaterialsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  subjectName: string;
}

interface Material {
  id: string;
  material_type: string;
  title: string;
  description?: string;
  file_url?: string;
  external_url?: string;
  source: string;
  created_at: string;
}

const materialTabs = [
  { value: "all", label: "Todos", icon: FolderOpen },
  { value: "audio", label: "Áudio", icon: Music },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "mindmap", label: "Mapas", icon: Brain },
  { value: "flashcard", label: "Flash", icon: Layers },
  { value: "presentation", label: "Apres.", icon: Presentation },
];

export function SubjectMaterials({
  open,
  onOpenChange,
  subjectId,
  subjectName,
}: SubjectMaterialsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    if (open && user && subjectId) {
      fetchMaterials();
    }
  }, [open, user, subjectId]);

  const fetchMaterials = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("subject_materials")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from("subject_materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;

      toast({
        title: "Material removido",
        description: "O material foi excluído com sucesso.",
      });

      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Erro ao remover",
        variant: "destructive",
      });
    }
  };

  const filteredMaterials =
    activeTab === "all"
      ? materials
      : materials.filter((m) => m.material_type === activeTab);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>Materiais: {subjectName}</span>
              <Button size="sm" onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </SheetTitle>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-6 mb-4">
              {materialTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center gap-1 px-1 py-2 text-xs"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredMaterials.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum material adicionado ainda.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Material
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {filteredMaterials.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <MaterialUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        subjectId={subjectId}
        onSuccess={fetchMaterials}
      />
    </>
  );
}
