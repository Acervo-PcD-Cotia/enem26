
# Atualizar Pagina "Tutores" com Novo Conteudo e Guia de Uso

## Resumo

Atualizar a pagina `/tutors` existente com novos titulos, descricoes e CTAs para os 3 cards, e adicionar uma secao "Guia Rapido" abaixo dos cards com dicas de uso e exemplos de prompts para copiar e colar.

---

## Arquivo a modificar

### `src/pages/Tutors.tsx`

**1) Atualizar dados dos 3 tutores:**

| Campo | Card 1 | Card 2 | Card 3 |
|-------|--------|--------|--------|
| Nome | Tutor Especialista em Fundamentos | Mentor de Estrategia e Atualidades | Treinador de Taticas e Cronograma |
| Especialidade | Literatura, Biologia, Sociologia e Fisica | Geopolitica, Historia e Matematica | TRI, Produtividade e Interpretacao |
| Descricao | Domine os temas que mais caem. Ideal para explicacoes diretas de conceitos complexos e repertorios culturais para sua redacao. | Alem da teoria, ajuda a entender o SISU, notas de corte e como usar temas atuais para ampliar seu repertorio sociocultural. | Aprenda a priorizar o que importa, criar cronogramas flexiveis e dominar tecnicas de interpretacao para ganhar tempo na prova. |
| CTA | Iniciar Conversa | Refinar Estrategia | Montar meu Plano |
| Emoji | (manter existentes) | (manter existentes) | (manter existentes) |

Os 3 links NotebookLM permanecem os mesmos.

**2) Atualizar header da pagina:**

- Titulo: "Central de Tutores IA -- ENEM 2026"
- Subtitulo: "Escolha o tutor ideal para a sua duvida. Cada um foi treinado com milhares de horas de conteudo especializado para o ENEM 2026. E gratuito e esta disponivel agora."

**3) Adicionar secao "Guia Rapido" abaixo dos cards:**

Nova secao com design limpo (estilo steps/dicas) contendo:

- Titulo: "Como extrair o melhor da sua IA"
- Texto introdutorio: "Para obter respostas incriveis, nao faca perguntas genericas. Seja especifico! Nossos tutores foram treinados com milhares de horas de conteudo especializado."
- 3 exemplos de "quebra-gelo" com botao de copiar cada um:
  1. **Para o Tutor 1:** "Explique as Leis de Newton usando um exemplo do cotidiano que eu nunca mais va esquecer."
  2. **Para o Tutor 2:** "Quais sao os 3 temas de atualidades mais quentes para citar em uma redacao sobre meio ambiente?"
  3. **Para o Tutor 3:** "Estou comecando agora e tenho pouco tempo. Quais sao os 5 assuntos de Matematica que garantem minha base no TRI?"
- Dica extra em destaque: "Voce tambem pode pedir para a IA 'Agir como um corretor de redacao' ou 'Criar um quiz de 5 perguntas sobre o tema X'."

A secao usara componentes existentes (`Card`, `motion.div`) e icones do lucide-react (`Lightbulb`, `Copy`, `MessageSquare`). O layout sera responsivo, mantendo a identidade visual roxa/branca do site.

---

## Secao tecnica

- Apenas 1 arquivo modificado: `src/pages/Tutors.tsx`
- Nenhuma biblioteca nova instalada
- Nenhuma tabela de banco criada ou alterada
- Funcionalidade de "copiar texto" usa `navigator.clipboard.writeText()` nativo
- Toast de confirmacao ao copiar usando `sonner` (ja instalado)
- Navegacao e BottomNavigation permanecem inalterados
