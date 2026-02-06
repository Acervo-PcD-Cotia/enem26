import { motion } from "framer-motion";
import { 
  Brain, 
  Calendar, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Bell,
  RefreshCw,
  FileText,
  Award
} from "lucide-react";

const benefits = [
  {
    icon: Calendar,
    title: "Cronograma Automático",
    description: "O sistema gera seu plano de estudos personalizado com base nos seus objetivos e disponibilidade.",
    color: "bg-gradient-primary shadow-primary",
  },
  {
    icon: Brain,
    title: "Revisões RPA Inteligentes",
    description: "Intervalos científicos de 24h a 180 dias garantem que você nunca esqueça o conteúdo.",
    color: "bg-gradient-success shadow-success",
  },
  {
    icon: Target,
    title: "Foco no Essencial",
    description: "A IA identifica seus pontos fracos e prioriza o que você mais precisa estudar.",
    color: "bg-gradient-energy shadow-energy",
  },
  {
    icon: BookOpen,
    title: "Caderno de Erros",
    description: "Cada erro vira uma oportunidade. O sistema transforma falhas em flashcards automáticos.",
    color: "bg-gradient-primary shadow-primary",
  },
  {
    icon: RefreshCw,
    title: "Replanejamento Dinâmico",
    description: "Atrasou um dia? O sistema redistribui as tarefas automaticamente. Nada fica para trás.",
    color: "bg-gradient-success shadow-success",
  },
  {
    icon: TrendingUp,
    title: "Métricas de Evolução",
    description: "Acompanhe seu progresso com gráficos detalhados por disciplina e assunto.",
    color: "bg-gradient-energy shadow-energy",
  },
  {
    icon: FileText,
    title: "Redação Semanal",
    description: "Agenda automática de redações com temas atuais e acompanhamento de notas.",
    color: "bg-gradient-primary shadow-primary",
  },
  {
    icon: Bell,
    title: "Notificações Inteligentes",
    description: "Lembretes personalizados de revisões críticas e tarefas do dia.",
    color: "bg-gradient-success shadow-success",
  },
  {
    icon: Award,
    title: "Gamificação Motivadora",
    description: "Streak de dias, conquistas e metas semanais para manter você engajado.",
    color: "bg-gradient-energy shadow-energy",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Por que escolher nossa plataforma?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tudo que você precisa para a{" "}
            <span className="text-gradient-primary">aprovação</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma completa que substitui planners, PDFs e planilhas por um sistema 
            inteligente que pensa pelo aluno.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-primary/10"
            >
              <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}>
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
