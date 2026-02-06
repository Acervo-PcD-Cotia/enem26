import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageCircle,
  Plus,
  Search,
  ThumbsUp,
  Loader2,
  HelpCircle,
  Lightbulb,
  BookX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: string;
  status: string;
  upvotes: number;
  created_at: string;
  subject?: {
    name: string;
    discipline?: {
      name: string;
      color: string;
    };
  };
}

const postTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  question: { icon: HelpCircle, label: "Dúvida objetiva", color: "text-blue-500" },
  learning: { icon: Lightbulb, label: "Algo que aprendi", color: "text-amber-500" },
  error_insight: { icon: BookX, label: "Erro que entendi", color: "text-red-500" },
};

export default function Community() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    post_type: "question",
    subject_id: "",
  });

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
      const [postsRes, subjectsRes] = await Promise.all([
        supabase
          .from("community_posts")
          .select(`
            *,
            subject:subjects(name, discipline:disciplines(name, color))
          `)
          .in("post_type", ["question", "learning", "error_insight"])
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("subjects").select("id, name").order("name"),
      ]);

      if (postsRes.data) setPosts(postsRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
    } catch (error) {
      console.error("Error fetching community data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title || !newPost.content) return;

    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
        post_type: newPost.post_type,
        subject_id: newPost.subject_id || null,
      });

      if (error) throw error;

      toast({
        title: "Publicação criada!",
        description: "Compartilhada com a comunidade.",
      });

      setNewPost({ title: "", content: "", post_type: "question", subject_id: "" });
      setShowCreateDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Erro ao criar publicação", variant: "destructive" });
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Comunidade</h1>
              <p className="text-sm text-muted-foreground">
                Compartilhe e aprenda junto
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na comunidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <Button onClick={() => setShowCreateDialog(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Nova Publicação
        </Button>

        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma publicação encontrada.
              </p>
            </div>
          ) : (
            filteredPosts.map((post, index) => {
              const typeConfig = postTypeConfig[post.post_type] || postTypeConfig.question;
              const TypeIcon = typeConfig.icon;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${typeConfig.color}`}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{post.title}</h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline">{typeConfig.label}</Badge>
                        {post.subject && (
                          <span
                            style={{
                              color: post.subject.discipline?.color,
                            }}
                          >
                            {post.subject.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {post.upvotes}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </main>

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Publicação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>O que você quer compartilhar?</Label>
              <Select
                value={newPost.post_type}
                onValueChange={(value) =>
                  setNewPost((prev) => ({ ...prev, post_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">🤔 Dúvida objetiva</SelectItem>
                  <SelectItem value="learning">💡 Algo que aprendi hoje</SelectItem>
                  <SelectItem value="error_insight">❌ Erro que cometi e entendi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assunto (opcional)</Label>
              <Select
                value={newPost.subject_id}
                onValueChange={(value) =>
                  setNewPost((prev) => ({ ...prev, subject_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um assunto" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Resumo da sua publicação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Descreva em detalhes..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleCreatePost}
              className="w-full"
              disabled={!newPost.title || !newPost.content}
            >
              Publicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentRoute="community" />
    </div>
  );
}
