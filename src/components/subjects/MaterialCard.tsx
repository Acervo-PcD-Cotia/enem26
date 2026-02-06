import { motion } from "framer-motion";
import {
  Music,
  Video,
  Brain,
  Layers,
  Presentation,
  ExternalLink,
  Youtube,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface MaterialCardProps {
  material: Material;
  onDelete: (id: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  audio: <Music className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  mindmap: <Brain className="w-5 h-5" />,
  flashcard: <Layers className="w-5 h-5" />,
  presentation: <Presentation className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  audio: "Áudio",
  video: "Vídeo",
  mindmap: "Mapa Mental",
  flashcard: "Flashcard",
  presentation: "Apresentação",
};

const sourceIcons: Record<string, React.ReactNode> = {
  upload: <FileText className="w-3 h-3" />,
  youtube: <Youtube className="w-3 h-3" />,
  gdrive: <FileText className="w-3 h-3" />,
  notebooklm: <Brain className="w-3 h-3" />,
};

const sourceLabels: Record<string, string> = {
  upload: "Upload",
  youtube: "YouTube",
  gdrive: "Google Drive",
  notebooklm: "NotebookLM",
};

export function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const url = material.file_url || material.external_url;

  const handleOpen = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {typeIcons[material.material_type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{material.title}</h4>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {sourceIcons[material.source]}
              {sourceLabels[material.source]}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {typeLabels[material.material_type]}
          </p>

          {material.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {material.description}
            </p>
          )}
        </div>

        <div className="flex gap-1">
          {url && (
            <Button variant="ghost" size="icon" onClick={handleOpen}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(material.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
