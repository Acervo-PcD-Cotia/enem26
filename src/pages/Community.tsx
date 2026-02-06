import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageCircle,
  Video,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  Loader2,
  HelpCircle,
  BookOpen,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  url: string;
  source: string;
  created_at: string;
  subject?: {
    name: string;
  };
}

const postTypeConfig = {
  question: { icon: HelpCircle, label: "Dúvida", color: "text-blue-500" },
  help: { icon: MessageCircle, label: "Ajuda", color: "text-amber-500" },
  resource: { icon: Share2, label: "Recurso", color: "text-green-500" },
  discussion: { icon: MessageSquare, label: "Discussão", color: "text-purple-500" },
};

export default function Community() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    post_type: "question",
    subject_id: "",
  });

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    resource_type: "video",
    url: "",
    source: "youtube",
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
      const [postsRes, resourcesRes, subjectsRes] = await Promise.all([
        supabase
          .from("community_posts")
          .select(`
            *,
            subject:subjects(name, discipline:disciplines(name, color))
          `)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("community_resources")
          .select(`
            *,
            subject:subjects(name)
          `)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("subjects").select("id, name").order("name"),
      ]);

      if (postsRes.data) setPosts(postsRes.data);
      if (resourcesRes.data) setResources(resourcesRes.data);
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
        title: "Post criado!",
        description: "Sua publicação foi compartilhada com a comunidade.",
      });

      setNewPost({ title: "", content: "", post_type: "question", subject_id: "" });
      setShowCreateDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erro ao criar post",
        variant: "destructive",
      });
    }
  };

  const handleCreateResource = async () => {
    if (!user || !newResource.title || !newResource.url) return;

    try {
      const { error } = await supabase.from("community_resources").insert({
        user_id: user.id,
        title: newResource.title,
        description: newResource.description || null,
        resource_type: newResource.resource_type,
        url: newResource.url,
        source: newResource.source,
        subject_id: newResource.subject_id || null,
      });

      if (error) throw error;

      toast({
        title: "Recurso adicionado!",
        description: "O recurso foi compartilhado com a comunidade.",
      });

      setNewResource({
        title: "",
        description: "",
        resource_type: "video",
        url: "",
        source: "youtube",
        subject_id: "",
      });
      setShowResourceDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        title: "Erro ao adicionar recurso",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
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

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussões
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Recursos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
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
                  const typeConfig = postTypeConfig[post.post_type as keyof typeof postTypeConfig];
                  const TypeIcon = typeConfig?.icon || MessageSquare;

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
                          className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${typeConfig?.color}`}
                        >
                          <TypeIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.status === "resolved" && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolvido
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {post.content}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline">{typeConfig?.label}</Badge>
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
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Button onClick={() => setShowResourceDialog(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Compartilhar Recurso
            </Button>

            <AnimatePresence mode="popLayout">
              {filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum recurso encontrado.
                  </p>
                </div>
              ) : (
                filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-red-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {resource.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {resource.resource_type === "video"
                              ? "Vídeo"
                              : resource.resource_type === "live"
                              ? "Live"
                              : "Grupo de Estudo"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {resource.source === "youtube"
                              ? "YouTube"
                              : resource.source === "gdrive"
                              ? "Google Drive"
                              : resource.source}
                          </Badge>
                          {resource.subject && (
                            <span className="text-xs text-muted-foreground">
                              {resource.subject.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(resource.url, "_blank")}
                      >
                        Acessar
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Publicação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
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
                  <SelectItem value="question">Dúvida</SelectItem>
                  <SelectItem value="help">Pedir Ajuda</SelectItem>
                  <SelectItem value="discussion">Discussão</SelectItem>
                  <SelectItem value="resource">Compartilhar Recurso</SelectItem>
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

      {/* Create Resource Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Recurso</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Recurso</Label>
              <Select
                value={newResource.resource_type}
                onValueChange={(value) =>
                  setNewResource((prev) => ({ ...prev, resource_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo/Aula</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="study_group">Grupo de Estudo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fonte</Label>
              <Select
                value={newResource.source}
                onValueChange={(value) =>
                  setNewResource((prev) => ({ ...prev, source: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="gdrive">Google Drive</SelectItem>
                  <SelectItem value="upload">Upload Próprio</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assunto (opcional)</Label>
              <Select
                value={newResource.subject_id}
                onValueChange={(value) =>
                  setNewResource((prev) => ({ ...prev, subject_id: value }))
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
              <Label htmlFor="resourceTitle">Título</Label>
              <Input
                id="resourceTitle"
                value={newResource.title}
                onChange={(e) =>
                  setNewResource((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nome do recurso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceUrl">URL</Label>
              <Input
                id="resourceUrl"
                type="url"
                value={newResource.url}
                onChange={(e) =>
                  setNewResource((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceDesc">Descrição (opcional)</Label>
              <Textarea
                id="resourceDesc"
                value={newResource.description}
                onChange={(e) =>
                  setNewResource((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Breve descrição do recurso..."
                rows={2}
              />
            </div>

            <Button
              onClick={handleCreateResource}
              className="w-full"
              disabled={!newResource.title || !newResource.url}
            >
              Compartilhar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentRoute="community" />
    </div>
  );
}
