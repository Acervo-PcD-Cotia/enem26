import { motion } from "framer-motion";
import { GraduationCap, Rocket, CalendarDays, ExternalLink, Lightbulb, Copy, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { toast } from "sonner";

const tutors = [
  {
    emoji: "🎓",
    icon: GraduationCap,
    name: "Tutor Especialista em Fundamentos",
    specialty: "Literatura, Biologia, Sociologia e Física",
    description: "Domine os temas que mais caem. Ideal para explicações diretas de conceitos complexos e repertórios culturais para sua redação.",
    url: "https://notebooklm.google.com/notebook/2e4d15c3-81de-43e4-ae0f-83408a697c6f/preview?authuser=4&pageId=none",
    gradient: "from-primary to-primary/60",
    cta: "Iniciar Conversa 💬",
  },
  {
    emoji: "🚀",
    icon: Rocket,
    name: "Mentor de Estratégia e Atualidades",
    specialty: "Geopolítica, História e Matemática",
    description: "Além da teoria, ajuda a entender o SISU, notas de corte e como usar temas atuais para ampliar seu repertório sociocultural.",
    url: "https://notebooklm.google.com/notebook/55e9c97a-2009-4185-919a-639b8bf7dc72/preview?authuser=4&pageId=none",
    gradient: "from-green-500 to-emerald-400",
    cta: "Refinar Estratégia 🚀",
  },
  {
    emoji: "📅",
    icon: CalendarDays,
    name: "Treinador de Táticas e Cronograma",
    specialty: "TRI, Produtividade e Interpretação",
    description: "Aprenda a priorizar o que importa, criar cronogramas flexíveis e dominar técnicas de interpretação para ganhar tempo na prova.",
    url: "https://notebooklm.google.com/notebook/1e810321-51c7-4528-9732-c30ffeb7689d/preview?authuser=4&pageId=none",
    gradient: "from-orange-500 to-amber-400",
    cta: "Montar meu Plano 📅",
  },
];

const icebreakers = [
  {
    tutor: "Tutor 1 – Fundamentos",
    text: "Explique as Leis de Newton usando um exemplo do cotidiano que eu nunca mais vá esquecer.",
    emoji: "🎓",
  },
  {
    tutor: "Tutor 2 – Estratégia",
    text: "Quais são os 3 temas de atualidades mais quentes para citar em uma redação sobre meio ambiente?",
    emoji: "🚀",
  },
  {
    tutor: "Tutor 3 – Táticas",
    text: "Estou começando agora e tenho pouco tempo. Quais são os 5 assuntos de Matemática que garantem minha base no TRI?",
    emoji: "📅",
  },
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Texto copiado! Cole no chat do tutor.");
  });
}

export default function Tutors() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Central de Tutores IA — ENEM 2026
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Escolha o tutor ideal para a sua dúvida. Cada um foi treinado com milhares de horas de conteúdo especializado para o ENEM 2026. É gratuito e está disponível agora.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutors.map((tutor, index) => (
            <motion.div
              key={tutor.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <a
                href={tutor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <Card className="relative h-full glass border-border/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/40 cursor-pointer group">
                  <Badge className="absolute top-3 right-3 bg-accent/20 text-accent-foreground border-accent/30 text-xs">
                    IA Gratuita
                  </Badge>

                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tutor.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <span className="text-2xl">{tutor.emoji}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{tutor.name}</h2>
                    <p className="text-sm text-muted-foreground">{tutor.specialty}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">{tutor.description}</p>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
                      asChild
                    >
                      <span>
                        {tutor.cta}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Guia Rápido */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Como extrair o melhor da sua IA
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Para obter respostas incríveis, não faça perguntas genéricas. Seja específico! Nossos tutores foram treinados com milhares de horas de conteúdo especializado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {icebreakers.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full border-border/50 bg-card/80">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {item.tutor}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground italic">"{item.text}"</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(item.text);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar prompt
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Dica Extra */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8"
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Dica de ouro:</span> Você também pode pedir para a IA{" "}
                  <span className="font-medium text-primary">"Agir como um corretor de redação"</span> ou{" "}
                  <span className="font-medium text-primary">"Criar um quiz de 5 perguntas sobre o tema X"</span>.
                  Isso aumenta muito o engajamento!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <BottomNavigation currentRoute="tutors" />
    </div>
  );
}
