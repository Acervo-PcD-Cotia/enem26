import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ana Clara Silva",
    role: "Aprovada em Medicina - UFMG",
    avatar: "AC",
    content: "Antes eu ficava perdida sobre o que estudar. Com a plataforma, é só seguir o plano! As revisões automáticas foram essenciais para fixar o conteúdo.",
    rating: 5,
  },
  {
    name: "Pedro Henrique Santos",
    role: "Aprovado em Engenharia - USP",
    avatar: "PH",
    content: "O caderno de erros mudou minha vida. Finalmente parei de errar as mesmas coisas. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Juliana Oliveira",
    role: "Aprovada em Direito - UERJ",
    avatar: "JO",
    content: "A gamificação me manteve motivada o ano inteiro. Bater o streak de 100 dias foi incrível! Não tem preço.",
    rating: 5,
  },
  {
    name: "Lucas Martins",
    role: "Aprovado em Ciência da Computação - UNICAMP",
    avatar: "LM",
    content: "O replanejamento automático salvou meu cronograma várias vezes. Mesmo quando eu atrasava, o sistema ajustava tudo.",
    rating: 5,
  },
  {
    name: "Maria Fernanda Costa",
    role: "Aprovada em Psicologia - UFRJ",
    avatar: "MF",
    content: "As redações semanais com temas atuais me prepararam muito bem. Tirei 980 na redação do ENEM!",
    rating: 5,
  },
  {
    name: "Gabriel Souza",
    role: "Aprovado em Arquitetura - UFPR",
    avatar: "GS",
    content: "Nunca pensei que estudar poderia ser tão organizado. A plataforma é simplesmente perfeita para quem quer passar no ENEM.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-energy/10 text-energy text-sm font-medium mb-4">
            Histórias de sucesso
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            O que nossos <span className="text-gradient-primary">alunos</span> dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mais de 5.000 alunos já estão se preparando para o ENEM 2026 com nossa plataforma.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-card relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
