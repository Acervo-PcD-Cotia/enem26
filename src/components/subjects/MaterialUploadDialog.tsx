import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Video,
  Brain,
  Layers,
  Presentation,
  Upload,
  Link,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MaterialUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  onSuccess: () => void;
}

const materialTypes = [
  { value: "audio", label: "Áudio", icon: Music },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "mindmap", label: "Mapa Mental", icon: Brain },
  { value: "flashcard", label: "Flashcard", icon: Layers },
  { value: "presentation", label: "Apresentação", icon: Presentation },
];

export function MaterialUploadDialog({
  open,
  onOpenChange,
  subjectId,
  onSuccess,
}: MaterialUploadDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("link");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    material_type: "",
    external_url: "",
    source: "youtube" as string,
  });

  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.material_type) return;

    setIsLoading(true);

    try {
      let fileUrl = null;

      if (activeTab === "upload" && file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${subjectId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("study-materials")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("study-materials")
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("subject_materials").insert({
        user_id: user.id,
        subject_id: subjectId,
        title: formData.title,
        description: formData.description || null,
        material_type: formData.material_type,
        file_url: fileUrl,
        external_url: activeTab === "link" ? formData.external_url : null,
        source: activeTab === "upload" ? "upload" : formData.source,
      });

      if (error) throw error;

      toast({
        title: "Material adicionado!",
        description: "O material foi salvo com sucesso.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        material_type: "",
        external_url: "",
        source: "youtube",
      });
      setFile(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: "Erro ao adicionar material",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Material</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Material</Label>
            <div className="grid grid-cols-5 gap-2">
              {materialTypes.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, material_type: type.value }))
                  }
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    formData.material_type === type.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-xs">{type.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ex: Aula de Cinemática"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Breve descrição do material..."
              rows={2}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Link
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Fonte</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, source: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="gdrive">Google Drive</SelectItem>
                    <SelectItem value="notebooklm">NotebookLM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, external_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept="audio/*,video/*,image/*,.pdf,.pptx,.ppt"
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: áudio, vídeo, imagem, PDF, PowerPoint
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.title || !formData.material_type}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Material"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
