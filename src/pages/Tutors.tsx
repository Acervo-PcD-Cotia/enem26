import { motion } from "framer-motion";
import { GraduationCap, Rocket, CalendarDays, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";

const tutors = [
  {
    emoji: "🎓",
    icon: GraduationCap,
    name: "Tutor Geral ENEM",
    specialty: "Filosofia, Biologia, Redação e Literatura",
    description: "Tire dúvidas sobre as matérias mais cobradas no ENEM com explicações claras e diretas.",
    url: "https://notebooklm.google.com/notebook/2e4d15c3-81de-43e4-ae0f-83408a697c6f?authuser=4&pageId=none",
    gradient: "from-primary to-primary/60",
  },
  {
    emoji: "🚀",
    icon: Rocket,
    name: "Tutor ProEnem 2026",
    specialty: "Redação, Ciências Humanas, Química e Geografia",
    description: "Aprofunde seus estudos com conteúdos avançados dos melhores canais do YouTube.",
    url: "https://notebooklm.google.com/notebook/55e9c97a-2009-4185-919a-639b8bf7dc72?authuser=4&pageId=none",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    emoji: "📅",
    icon: CalendarDays,
    name: "Tutor Plano de Estudos",
    specialty: "Organização, Cronograma e Estratégias de Estudo",
    description: "Monte seu plano de estudos personalizado e otimize seu tempo até o ENEM.",
    url: "https://notebooklm.google.com/notebook/1e810321-51c7-4528-9732-c30ffeb7689d?authuser=4&pageId=none",
    gradient: "from-orange-500 to-amber-400",
  },
];

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
            Converse com seu Tutor ENEM+ 2026
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Escolha o tutor ideal para a sua dúvida. Cada um foi treinado com centenas de aulas dos melhores canais do YouTube para o ENEM 2026. É gratuito e está disponível agora.
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
                <Card className="relative h-full glass border-border/50 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-primary/40 cursor-pointer group">
                  {/* Badge */}
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
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity group-hover:shadow-primary"
                      asChild
                    >
                      <span>
                        Conversar agora
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNavigation currentRoute="tutors" />
    </div>
  );
}
