import { motion } from "framer-motion";
import { UserPlus, ClipboardList, PlayCircle, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Em menos de 2 minutos você configura seu perfil e define seus objetivos para o ENEM 2026.",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Responda o diagnóstico",
    description: "Informe seu curso desejado, nota alvo, disponibilidade e nível atual em cada área.",
  },
  {
    step: "03",
    icon: PlayCircle,
    title: "Siga o plano diário",
    description: "Acesse seu dashboard todo dia e execute as tarefas: estudo, revisões, questões e redações.",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Evolua constantemente",
    description: "O sistema aprende com seu desempenho e ajusta o plano para maximizar sua evolução.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Simples e eficiente
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Como <span className="text-gradient-primary">funciona</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Em 4 passos simples você terá seu plano de estudos personalizado pronto para usar.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-energy transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 border border-border shadow-card relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white text-sm font-bold shadow-primary">
                      {item.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 mt-2">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
