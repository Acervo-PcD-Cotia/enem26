import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o sistema de revisões RPA?",
    answer: "RPA significa Revisão Programada Automática. Cada assunto que você estuda gera automaticamente revisões em intervalos científicos: 24h, 7 dias, 15 dias, 30 dias, 60 dias, 120 dias e 180 dias. As revisões são sempre ativas (questões, flashcards ou resumos), nunca leitura passiva.",
  },
  {
    question: "Preciso criar meu próprio cronograma?",
    answer: "Não! O sistema cria seu cronograma automaticamente com base no seu curso desejado, nota alvo, disponibilidade e nível atual. Você só precisa seguir as tarefas diárias que aparecem no dashboard.",
  },
  {
    question: "O que acontece se eu atrasar um dia de estudo?",
    answer: "Sem problemas! O sistema possui replanejamento dinâmico. Se você atrasar, as tarefas são automaticamente redistribuídas nos próximos dias, priorizando revisões críticas para que você nunca perca conteúdo importante.",
  },
  {
    question: "A plataforma funciona no celular?",
    answer: "Sim! A plataforma é totalmente responsiva e otimizada para mobile. Você pode estudar de qualquer dispositivo: computador, tablet ou smartphone.",
  },
  {
    question: "Como funciona o caderno de erros?",
    answer: "Cada questão que você erra é automaticamente registrada com contexto (questão, alternativa marcada, correta e motivo do erro). Você pode transformar erros em flashcards com um clique, e a IA prioriza erros recorrentes no seu plano de estudos.",
  },
  {
    question: "As redações são corrigidas automaticamente?",
    answer: "O sistema agenda redações semanais automaticamente e fornece temas atualizados. Você registra suas redações com notas por competência (C1 a C5) e acompanha sua evolução ao longo do tempo com gráficos detalhados.",
  },
  {
    question: "Posso usar a plataforma de graça?",
    answer: "Sim! Oferecemos um plano gratuito com funcionalidades essenciais para você começar. Planos premium desbloqueiam recursos avançados como IA adaptativa, análise de padrões de erro e sugestões personalizadas.",
  },
  {
    question: "Em quanto tempo vou ver resultados?",
    answer: "A maioria dos alunos relata melhora significativa em 2-4 semanas de uso consistente. O segredo é seguir o plano diariamente e nunca pular as revisões RPA.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
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
            Dúvidas frequentes
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Perguntas <span className="text-gradient-primary">frequentes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo que você precisa saber sobre nossa plataforma de estudos para o ENEM 2026.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 shadow-card"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
